import { NextResponse } from "next/server"
import { auth, clerkClient } from "@clerk/nextjs/server"
import prismadb from "@/lib/prisma"

export async function POST(req: Request) {
  const clerk = await clerkClient()

  try {
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const { userId, name, address, latitude, longitude, contact_info, description, pix_key, pix_key_type } = body

    // Verificar se o usuário existe e se é o mesmo que está fazendo a requisição
    const user = await prismadb.user.findUnique({
      where: {
        id: userId,
        clerk_id: clerkUserId,
      },
      include: {
        salon: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar se já tem um salão cadastrado
    if (user.salon) {
      return NextResponse.json({ error: "Usuário já possui um estabelecimento cadastrado" }, { status: 400 })
    }

    // Criar o salão
    const defaultWorkingDays = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday"
    ];
    const salon = await prismadb.salon.create({
      data: {
        name,
        address,
        latitude: Number.parseFloat(latitude),
        longitude: Number.parseFloat(longitude),
        contact_info,
        description,
        pix_key,
        pix_key_type,
        status: "PENDING",
        user_id: userId,
        working_days: defaultWorkingDays
      },
    })

    console.log(`Salão criado: ${salon.id} para usuário ${userId}`)

    return NextResponse.json({
      success: true,
      salon: {
        id: salon.id,
        name: salon.name,
        status: salon.status,
      },
    })
  } catch (error) {
    console.error("Erro ao registrar parceiro:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
