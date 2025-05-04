import { Webhook } from "svix"
import { headers } from "next/headers"
import type { WebhookEvent } from "@clerk/nextjs/server"
import prismadb from "@/lib/prisma"

export async function POST(req: Request) {
  // Obter o cabeçalho de assinatura do Clerk
  console.log('teste webhook', req)
  const headerPayload = headers()
  const svix_id = (await headerPayload).get("svix-id")
  const svix_timestamp = (await headerPayload).get("svix-timestamp")
  const svix_signature = (await headerPayload).get("svix-signature")

  // Se algum dos cabeçalhos estiver faltando, retornar erro
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Erro nos cabeçalhos do webhook")
    return new Response("Erro nos cabeçalhos do webhook", {
      status: 400,
    })
  }

  // Obter o corpo da requisição
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Validar o webhook
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "")
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error("Erro ao verificar webhook:", err)
    return new Response("Erro ao verificar webhook", {
      status: 400,
    })
  }

  const eventType = evt.type

  console.log(`Webhook recebido: ${eventType}`)
  console.log(`Dados do evento:`, JSON.stringify(evt.data, null, 2))

  // Processar eventos do Clerk
  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name } = evt.data

    try {
      // Verificar se o usuário já existe
      const existingUser = await prismadb.user.findUnique({
        where: {
          clerk_id: id,
        },
      })

      if (!existingUser) {
        // Criar usuário no banco de dados
        const newUser = await prismadb.user.create({
          data: {
            clerk_id: id,
            email: email_addresses[0].email_address,
            name: `${first_name || ""} ${last_name || ""}`.trim() || "Usuário",
            role: "CLIENT",
          },
        })

        console.log(`Usuário criado com sucesso via webhook: ${newUser.id}`)

        // Você pode adicionar aqui lógica para criar registros relacionados, como uma assinatura gratuita inicial
      } else {
        console.log(`Usuário já existe: ${existingUser.id}`)
      }
    } catch (error) {
      console.error("Erro ao criar usuário via webhook:", error)
      return new Response(`Erro ao criar usuário: ${error}`, { status: 500 })
    }
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name } = evt.data

    try {
      // Atualizar usuário no banco de dados
      const existingUser = await prismadb.user.findUnique({
        where: {
          clerk_id: id,
        },
      })

      if (existingUser) {
        await prismadb.user.update({
          where: {
            clerk_id: id,
          },
          data: {
            email: email_addresses[0].email_address,
            name: `${first_name || ""} ${last_name || ""}`.trim() || "Usuário",
          },
        })

        console.log(`Usuário atualizado com sucesso via webhook: ${existingUser.id}`)
      } else {
        // Se o usuário não existir, criar um novo
        const newUser = await prismadb.user.create({
          data: {
            clerk_id: id,
            email: email_addresses[0].email_address,
            name: `${first_name || ""} ${last_name || ""}`.trim() || "Usuário",
            role: "CLIENT",
          },
        })

        console.log(`Usuário criado durante atualização via webhook: ${newUser.id}`)
      }
    } catch (error) {
      console.error("Erro ao atualizar usuário via webhook:", error)
      return new Response(`Erro ao atualizar usuário: ${error}`, { status: 500 })
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data

    try {
      // Excluir usuário do banco de dados
      await prismadb.user.delete({
        where: {
          clerk_id: id,
        },
      })

      console.log(`Usuário excluído com sucesso via webhook: ${id}`)
    } catch (error) {
      console.error("Erro ao excluir usuário via webhook:", error)
      return new Response(`Erro ao excluir usuário: ${error}`, { status: 500 })
    }
  }

  return new Response("Webhook processado com sucesso", { status: 200 })
}
