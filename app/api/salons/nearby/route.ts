import { NextResponse } from "next/server"
import prismadb from "@/lib/prisma"

// Função para calcular a distância entre dois pontos usando a fórmula de Haversine
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371 // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // Distância em km
  return distance
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const lat = Number.parseFloat(searchParams.get("lat") || "0")
    const lng = Number.parseFloat(searchParams.get("lng") || "0")
    const radius = Number.parseFloat(searchParams.get("radius") || "10") // Raio em km
    const search = searchParams.get("search") || ""

    if (!lat || !lng) {
      return NextResponse.json({ error: "Latitude e longitude são obrigatórios" }, { status: 400 })
    }

    // Buscar todos os salões aprovados
    const allSalons = await prismadb.salon.findMany({
      where: {
        status: "APPROVED",
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { address: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        services: true,
      },
    })

    // Filtrar salões por distância e adicionar a distância calculada
    const nearbySalons = allSalons
      .map((salon) => {
        const distance = calculateDistance(lat, lng, salon.latitude, salon.longitude)
        return { ...salon, distance }
      })
      .filter((salon) => salon.distance <= radius)
      .sort((a, b) => a.distance - b.distance)

    return NextResponse.json(nearbySalons)
  } catch (error) {
    console.error("Erro ao buscar salões próximos:", error)
    return NextResponse.json({ error: "Erro ao buscar salões próximos" }, { status: 500 })
  }
}
