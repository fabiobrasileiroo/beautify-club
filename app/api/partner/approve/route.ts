import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import prismadb from "@/lib/prisma"
import { clerkClient } from "@clerk/nextjs/server"

export async function POST(req: Request) {
  const clerk = await clerkClient();
  try {
    const { userId: clerkId } = await auth()

    if (!clerkId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Verificar se o usuário é um administrador
    const adminUser = await prismadb.user.findUnique({
      where: { clerk_id: clerkId },
    })

    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const body = await req.json()
    const { salonId } = body

    if (!salonId) {
      return NextResponse.json({ error: "ID do salão não fornecido" }, { status: 400 })
    }

    // Buscar o salão
    const salon = await prismadb.salon.findUnique({
      where: { id: salonId },
      include: { user: true },
    })

    if (!salon) {
      return NextResponse.json({ error: "Salão não encontrado" }, { status: 404 })
    }

    // Atualizar o status do salão para APPROVED
    const updatedSalon = await prismadb.salon.update({
      where: { id: salonId },
      data: { status: "APPROVED" },
    })

    // Atualizar os metadados do usuário no Clerk
    const user = await clerk.users.getUser(salon.user.clerk_id)
    await clerk.users.updateUser(user.id, {
      publicMetadata: {
        ...user.publicMetadata,
        role: "PARTNER",
      },
    })

    // Enviar notificação ao parceiro (implementação futura)

    return NextResponse.json({
      success: true,
      message: "Parceiro aprovado com sucesso",
      salon: updatedSalon,
    })
  } catch (error) {
    console.error("Erro ao aprovar parceiro:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}
