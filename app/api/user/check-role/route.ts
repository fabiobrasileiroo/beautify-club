import { NextResponse } from "next/server"
import prismadb from "@/lib/prisma"
import { auth, clerkClient } from "@clerk/nextjs/server"

export async function GET() {
  const clerk = await clerkClient();
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar o usuário no banco de dados
    const dbUser = await prismadb.user.findUnique({
      where: {
        clerk_id: userId,
      },
    })

    if (!dbUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar se o papel nos metadados do Clerk está correto
    const clerkUserInfo =
     await clerk.users.getUser(userId)
    const clerkRole = clerkUserInfo.publicMetadata?.role as string

    // Se o papel no Clerk for diferente do papel no banco de dados, atualizar os metadados do Clerk
    if (clerkRole !== dbUser.role) {
      await clerk.users.updateUser(userId, {
        publicMetadata: {
          ...clerkUserInfo.publicMetadata,
          role: dbUser.role,
          userId: dbUser.id,
        },
      })

      console.log(`Papel do usuário sincronizado: ${dbUser.id}, Role: ${dbUser.role}`)
    }

    return NextResponse.json({
      success: true,
      role: dbUser.role,
      userId: dbUser.id,
    })
  } catch (error) {
    console.error("Erro ao verificar papel do usuário:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}
