import { NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import prismadb from "@/lib/prisma"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
})

// Interfaces para contornar problemas de tipagem da versão beta
interface StripeInvoiceWithSubscription extends Stripe.Invoice {
  subscription?: string | Stripe.Subscription
}

interface StripeSubscriptionExpanded {
  id: string
  current_period_start: number
  current_period_end: number
  status: string
  cancel_at_period_end?: boolean
  customer: string | Stripe.Customer
}

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

    console.log(`Webhook recebido: ${event.type}`)

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode === "subscription") {
          await handleSubscriptionCreated(session)
        }
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as StripeInvoiceWithSubscription

        // Verificar se a invoice tem subscription associada
        if (invoice.subscription) {
          await handlePaymentSucceeded(invoice)
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCanceled(subscription)
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }

      default:
        console.log(`Evento não tratado: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Erro ao processar webhook:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

async function handleSubscriptionCreated(session: Stripe.Checkout.Session) {
  try {
    const userId = session.metadata?.userId
    const planId = session.metadata?.planId

    if (!userId || !planId) {
      console.error("Metadados ausentes na sessão de checkout")
      return
    }

    // Buscar a subscription no Stripe para obter detalhes
    const stripeSubscriptionResponse = await stripe.subscriptions.retrieve(session.subscription as string)
    const stripeSubscription = stripeSubscriptionResponse as any as StripeSubscriptionExpanded
    
    const startDate = new Date(stripeSubscription.current_period_start * 1000)
    const endDate = new Date(stripeSubscription.current_period_end * 1000)

    // Criar assinatura no banco de dados
    const subscriptionDb = await prismadb.subscription.create({
      data: {
        user_id: userId,
        plan_id: planId,
        start_date: startDate,
        end_date: endDate,
        status: "ACTIVE",
      },
    })

    console.log(`Assinatura criada: ${subscriptionDb.id} para usuário ${userId}`)

    // Registrar o primeiro pagamento
    if (session.amount_total) {
      await prismadb.payment.create({
        data: {
          subscription_id: subscriptionDb.id,
          amount: session.amount_total / 100, // Converter de centavos para reais
          paid_at: new Date(),
          method: "stripe",
          status: "COMPLETED",
        },
      })

      console.log(`Pagamento inicial registrado para assinatura ${subscriptionDb.id}`)
    }
  } catch (error) {
    console.error("Erro ao processar criação de assinatura:", error)
  }
}

async function handlePaymentSucceeded(invoice: StripeInvoiceWithSubscription) {
  try {
    // Acessar subscription de forma segura
    const subscriptionId = typeof invoice.subscription === 'string' 
      ? invoice.subscription 
      : invoice.subscription?.id

    if (!subscriptionId) {
      console.log("Invoice não possui subscription associada")
      return
    }

    const stripeSubscriptionResponse = await stripe.subscriptions.retrieve(subscriptionId)
    const stripeSubscription = stripeSubscriptionResponse as any as StripeSubscriptionExpanded

    // Buscar assinatura no banco pelo customer
    const customer = await stripe.customers.retrieve(invoice.customer as string)
    if (!customer || customer.deleted) return

    const customerEmail = "email" in customer ? customer.email : null
    if (!customerEmail) return

    const user = await prismadb.user.findUnique({
      where: { email: customerEmail },
    })

    if (!user) return

    const subscription = await prismadb.subscription.findFirst({
      where: {
        user_id: user.id,
        status: "ACTIVE",
      },
      orderBy: { created_at: "desc" },
    })

    if (!subscription) return

    // Atualizar datas da assinatura
    const newEndDate = new Date(stripeSubscription.current_period_end * 1000)

    await prismadb.subscription.update({
      where: { id: subscription.id },
      data: {
        end_date: newEndDate,
        status: "ACTIVE",
      },
    })

    // Registrar pagamento recorrente
    await prismadb.payment.create({
      data: {
        subscription_id: subscription.id,
        amount: invoice.amount_paid / 100, // Converter de centavos para reais
        paid_at: new Date(invoice.status_transitions.paid_at! * 1000),
        method: "stripe",
        status: "COMPLETED",
      },
    })

    console.log(`Pagamento recorrente registrado para assinatura ${subscription.id}`)
  } catch (error) {
    console.error("Erro ao processar pagamento recorrente:", error)
  }
}

async function handleSubscriptionCanceled(stripeSubscription: Stripe.Subscription) {
  try {
    const customer = await stripe.customers.retrieve(stripeSubscription.customer as string)
    if (!customer || "deleted" in customer) return

    const customerEmail = "email" in customer ? customer.email : null
    if (!customerEmail) return

    const user = await prismadb.user.findUnique({
      where: { email: customerEmail },
    })

    if (!user) return

    // Atualizar status da assinatura para CANCELED
    await prismadb.subscription.updateMany({
      where: {
        user_id: user.id,
        status: "ACTIVE",
      },
      data: {
        status: "CANCELED",
      },
    })

    console.log(`Assinatura cancelada para usuário ${user.email}`)
  } catch (error) {
    console.error("Erro ao processar cancelamento de assinatura:", error)
  }
}

async function handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription) {
  try {
    // Cast para nossa interface customizada
    const subscription = stripeSubscription as any as StripeSubscriptionExpanded

    const customer = await stripe.customers.retrieve(subscription.customer as string)
    if (!customer || "deleted" in customer) return

    const customerEmail = "email" in customer ? customer.email : null
    if (!customerEmail) return

    const user = await prismadb.user.findUnique({
      where: { email: customerEmail },
    })

    if (!user) return

    const subscriptionDb = await prismadb.subscription.findFirst({
      where: {
        user_id: user.id,
        status: { in: ["ACTIVE", "CANCELED"] },
      },
      orderBy: { created_at: "desc" },
    })

    if (!subscriptionDb) return

    // Atualizar datas e status baseado no status do Stripe
    const newEndDate = new Date(subscription.current_period_end * 1000)
    const newStatus =
      subscription.status === "active"
        ? "ACTIVE"
        : subscription.cancel_at_period_end
          ? "CANCELED"
          : "ACTIVE"

    await prismadb.subscription.update({
      where: { id: subscriptionDb.id },
      data: {
        end_date: newEndDate,
        status: newStatus,
      },
    })

    console.log(`Assinatura atualizada: ${subscriptionDb.id} - Status: ${newStatus}`)
  } catch (error) {
    console.error("Erro ao processar atualização de assinatura:", error)
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}