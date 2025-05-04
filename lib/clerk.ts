import type { User } from "@clerk/nextjs/server"
import prismadb from "@/lib/prisma"

export async function syncClerkUser(clerkUser: User) {
  if (!clerkUser) throw new Error("No Clerk user provided")

  // Extrair o email principal do usuário Clerk
  const primaryEmail = clerkUser.emailAddresses?.find(
    (email) => email.id === clerkUser.primaryEmailAddressId,
  )?.emailAddress

  if (!primaryEmail) throw new Error("No email found for Clerk user")

  const userData = {
    name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "Usuário",
    email: primaryEmail,
    role: "CLIENT", // Papel padrão para novos usuários
  }

  console.log(`Sincronizando usuário Clerk: ${clerkUser.id}, Email: ${primaryEmail}`)

  try {
    // Verificar se o usuário já existe
    const existingUser = await prismadb.user.findUnique({
      where: { clerk_id: clerkUser.id },
    })

    if (existingUser) {
      console.log(`Usuário existente encontrado: ${existingUser.id}`)

      // Atualizar apenas se houver mudanças
      if (existingUser.email !== userData.email || existingUser.name !== userData.name) {
        const updatedUser = await prismadb.user.update({
          where: { clerk_id: clerkUser.id },
          data: userData,
        })
        console.log(`Usuário atualizado: ${updatedUser.id}`)
        return updatedUser
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

      console.log(`Novo usuário criado: ${newUser.id}`)

      // Atualizar metadados do Clerk
      await clerkUser.update({
        publicMetadata: {
          userId: newUser.id,
          role: "CLIENT",
        },
      })

      return newUser
    }
  } catch (error) {
    console.error("Erro ao sincronizar usuário:", error)
    throw error
  }
}
