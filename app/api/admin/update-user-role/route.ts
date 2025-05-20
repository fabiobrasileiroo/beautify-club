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
    const { userId, role } = body

    if (!userId || !role) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    if (!["CLIENT", "PARTNER", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Papel inválido" }, { status: 400 })
    }

    // Buscar o usuário
    const user = await prismadb.user.findUnique({
      where: { id: userId },
      include: { salon: true },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Atualizar o papel do usuário
    const updatedUser = await prismadb.user.update({
      where: { id: userId },
      data: { role },
    })

    // Atualizar os metadados do usuário no Clerk
    await clerk.users.updateUser(user.clerk_id, {
      publicMetadata: {
        role,
        userId: user.id,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Papel do usuário atualizado com sucesso",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Erro ao atualizar papel do usuário:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}
