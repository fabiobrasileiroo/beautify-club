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

      // Verificar se a subscription já existe para evitar duplicatas
      const existingSubscription = await prismadb.subscription.findFirst({
        where: {
          user_id: userId,
          plan_id: planId,
          status: "ACTIVE"
        }
      })

      if (existingSubscription) {
        console.log("Subscription já existe, criando apenas o pagamento")
        
        // Criar apenas o pagamento se a subscription já existe
        await prismadb.payment.create({
          data: {
            subscription_id: existingSubscription.id, // ✅ CORRETO: usar o ID da subscription
            amount: session.amount_total! / 100,
            paid_at: new Date(),
            method: "stripe",
            status: "COMPLETED",
          },
        })
      } else {
        // Criar assinatura no banco de dados
        const startDate = new Date()
        const endDate = new Date()
        endDate.setMonth(endDate.getMonth() + 1) // Assinatura mensal

        const newSubscription = await prismadb.subscription.create({
          data: {
            user_id: userId,
            plan_id: planId,
            start_date: startDate,
            end_date: endDate,
            status: "ACTIVE",
          },
        })

        // Registrar pagamento usando o ID da subscription criada
        await prismadb.payment.create({
          data: {
            subscription_id: newSubscription.id, // ✅ CORRETO: usar o ID da subscription criada
            amount: session.amount_total! / 100,
            paid_at: new Date(),
            method: "stripe",
            status: "COMPLETED",
          },
        })
      }

      console.log("Pagamento processado com sucesso para userId:", userId)
    }

    // Processar cancelamentos de assinatura
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription
      const stripeCustomerId = subscription.customer as string

      // Buscar subscription pelo stripe subscription ID
      // Você pode armazenar o stripe_subscription_id na tabela subscription
      // Por enquanto, vamos usar os metadados se disponíveis
      
      try {
        // Se você tiver um campo stripe_subscription_id na tabela subscription
        // await prismadb.subscription.updateMany({
        //   where: { stripe_subscription_id: subscription.id },
        //   data: { status: "CANCELED" }
        // })

        console.log("Subscription cancelada no Stripe:", subscription.id)
      } catch (error) {
        console.error("Erro ao cancelar subscription:", error)
      }
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