import type { User } from "@clerk/nextjs/server"
import { clerkClient } from "@clerk/nextjs/server"
import prismadb from "@/lib/prisma"

export async function syncClerkUser(clerkUser: User) {
   const clerk = await clerkClient();
  if (!clerkUser) throw new Error("No Clerk user provided")

  // Extrair o email principal do usuário Clerk
  const primaryEmail = clerkUser.emailAddresses?.find(
    (email) => email.id === clerkUser.primaryEmailAddressId,
  )?.emailAddress

  if (!primaryEmail) throw new Error("No email found for Clerk user")

  // Verificar se o papel já está definido nos metadados do Clerk
  const clerkRole = (clerkUser.publicMetadata?.role as string) || "CLIENT"

  // Verificar se é o primeiro usuário no sistema (será admin)
  const userCount = await prismadb.user.count()
  const isFirstUser = userCount === 0
  const userRole = isFirstUser ? "ADMIN" : clerkRole

  const userData = {
    name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "Usuário",
    email: primaryEmail,
    role: userRole as "ADMIN" | "PARTNER" | "CLIENT", // Usar o papel dos metadados do Clerk
  }

  console.log(`Sincronizando usuário Clerk: ${clerkUser.id}, Email: ${primaryEmail}, Role: ${userRole}`)

  try {
    // Verificar se o usuário já existe
    const existingUser = await prismadb.user.findUnique({
      where: { clerk_id: clerkUser.id },
    })

    if (existingUser) {
      console.log(`Usuário existente encontrado: ${existingUser.id}, Role: ${existingUser.role}`)

      // Atualizar apenas se houver mudanças, mas preservar o papel existente
      if (existingUser.email !== userData.email || existingUser.name !== userData.name) {
        const updatedUser = await prismadb.user.update({
          where: { clerk_id: clerkUser.id },
          data: {
            email: userData.email,
            name: userData.name,
            // Manter o papel existente, a menos que seja explicitamente definido nos metadados
            role: clerkUser.publicMetadata?.role
              ? (clerkUser.publicMetadata.role as "ADMIN" | "PARTNER" | "CLIENT")
              : existingUser.role,
          },
        })
        console.log(`Usuário atualizado: ${updatedUser.id}, Role: ${updatedUser.role}`)

        // Garantir que os metadados do Clerk estejam atualizados com o papel correto do banco de dados
        if (clerkUser.publicMetadata?.role !== updatedUser.role) {
          await clerk.users.updateUser(clerkUser.id, {
            publicMetadata: {
              ...clerkUser.publicMetadata,
              userId: updatedUser.id,
              role: updatedUser.role,
            },
          })
        }

        return updatedUser
      }

      // Se não houver mudanças, ainda assim garantir que os metadados do Clerk estejam corretos
      if (clerkUser.publicMetadata?.role !== existingUser.role) {
        await clerk.users.updateUser(clerkUser.id, {
          publicMetadata: {
            ...clerkUser.publicMetadata,
            userId: existingUser.id,
            role: existingUser.role,
          },
        })
      }

      return existingUser
    } else {
      // Criar novo usuário
      const newUser = await prismadb.user.create({
        data: {
          clerk_id: clerkUser.id,
          ...userData,
        },
      })

      console.log(`Novo usuário criado: ${newUser.id}, Role: ${newUser.role}`)

      // Atualizar metadados do Clerk
      await clerk.users.updateUser(clerkUser.id, {
        publicMetadata: {
          ...clerkUser.publicMetadata,
          userId: newUser.id,
          role: newUser.role,
        },
      })

      return newUser
    }
  } catch (error) {
    console.error("Erro ao sincronizar usuário:", error)
    throw error
  }
}

// Função para atualizar o papel do usuário
export async function updateUserRole(userId: string, newRole: "CLIENT" | "PARTNER" | "ADMIN") {
  try {
    const user = await prismadb.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error("Usuário não encontrado")
    }

    const updatedUser = await prismadb.user.update({
      where: { id: userId },
      data: { role: newRole },
    })

    return updatedUser
  } catch (error) {
    console.error("Erro ao atualizar papel do usuário:", error)
    throw error
  }
}
