import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import prismadb from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth()

    if (!clerkId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const { userId, name, address, latitude, longitude, contact_info, description, pix_key, pix_key_type } = body

    if (
      !userId ||
      !name ||
      !address ||
      !latitude ||
      !longitude ||
      !contact_info ||
      !description ||
      !pix_key ||
      !pix_key_type
    ) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    // Verificar se o usuário existe
    const user = await prismadb.user.findUnique({
      where: { id: userId },
      include: { salon: true },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar se o usuário já tem um salão cadastrado
    if (user.salon) {
      return NextResponse.json({ error: "Usuário já possui um estabelecimento cadastrado" }, { status: 400 })
    }

    // Criar o salão
    const salon = await prismadb.salon.create({
      data: {
        user_id: userId,
        name,
        address,
        latitude,
        longitude,
        contact_info,
        description,
        pix_key,
        pix_key_type,
        status: "PENDING",
      },
    })

    // Atualizar o papel do usuário para PARTNER
    await prismadb.user.update({
      where: { id: userId },
      data: { role: "PARTNER" },
    })

    return NextResponse.json({
      success: true,
      message: "Solicitação de parceria enviada com sucesso",
      salon,
    })
  } catch (error) {
    console.error("Erro ao registrar parceiro:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}
