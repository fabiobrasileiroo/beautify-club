import { NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"

import prismadb from "@/lib/prisma"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = (await headers()).get("Stripe-Signature") as string

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (error) {
      console.error("Erro ao verificar assinatura do webhook:", error)
      return NextResponse.json({ error: "Webhook error" }, { status: 400 })
    }

    const session = event.data.object as Stripe.Checkout.Session

    // Processar eventos relevantes
    if (event.type === "checkout.session.completed") {
      // Extrair metadados
      const userId = session.metadata?.userId
      const planId = session.metadata?.planId

      if (!userId || !planId) {
        console.error("Metadados ausentes na sessão de checkout")
        return NextResponse.json({ error: "Metadados ausentes" }, { status: 400 })
      }

      // Criar assinatura no banco de dados
      const startDate = new Date()
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + 1) // Assinatura mensal

      await prismadb.subscription.create({
        data: {
          user_id: userId,
          plan_id: planId,
          start_date: startDate,
          end_date: endDate,
          status: "ACTIVE",
        },
      })

      // Registrar pagamento
      await prismadb.payment.create({
        data: {
          subscription_id: planId,
          amount: session.amount_total! / 100, // Converter de centavos para reais
          paid_at: new Date(),
          method: "stripe",
          status: "COMPLETED",
        },
      })
    }

    // Processar cancelamentos de assinatura
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription
      const stripeCustomerId = subscription.customer as string

      // Buscar usuário pelo Stripe Customer ID
      // Nota: Seria necessário armazenar o stripeCustomerId no usuário
      // Aqui estamos usando o metadata como exemplo

      // Atualizar status da assinatura para CANCELED
      // Este é um exemplo simplificado - na implementação real,
      // você precisaria mapear o ID da assinatura do Stripe para o ID da assinatura no seu banco
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Erro ao processar webhook:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
