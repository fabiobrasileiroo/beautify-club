import { NextResponse } from "next/server"
import prismadb from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { clerkClient } from "@clerk/nextjs/server"

export async function GET() {
  const clerk = await clerkClient();
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Verificar se é o primeiro usuário no sistema
    const userCount = await prismadb.user.count()

    if (userCount === 1) {
      // Verificar se o usuário atual é o único usuário
      const user = await prismadb.user.findFirst()

      if (user && user.clerk_id === userId) {
        // Atualizar o papel do usuário para ADMIN se ainda não for
        if (user.role !== "ADMIN") {
          await prismadb.user.update({
            where: { id: user.id },
            data: { role: "ADMIN" },
          })

          // Atualizar os metadados do Clerk
          await clerk.users.updateUser(userId, {
            publicMetadata: {
              role: "ADMIN",
              userId: user.id,
            },
          })

          return NextResponse.json({
            success: true,
            message: "Você foi definido como o administrador do sistema",
            isFirstUser: true,
            isAdmin: true,
          })
        }

        return NextResponse.json({
          success: true,
          message: "Você já é o administrador do sistema",
          isFirstUser: true,
          isAdmin: true,
        })
      }
    }

    // Verificar se o usuário atual é um administrador
    const currentUser = await prismadb.user.findFirst({
      where: { clerk_id: userId },
    })

    return NextResponse.json({
      success: true,
      isFirstUser: false,
      isAdmin: currentUser?.role === "ADMIN",
    })
  } catch (error) {
    console.error("Erro ao verificar primeiro usuário:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}
