import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import Stripe from "stripe"
import prismadb from "@/lib/prisma"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
})

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
    }

    const { planId } = await request.json()

    if (!planId) {
      return NextResponse.json({ error: "ID do plano é obrigatório" }, { status: 400 })
    }

    // Buscar o usuário no banco de dados
    const user = await prismadb.user.findUnique({
      where: { clerk_id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Buscar o plano
    const plan = await prismadb.subscriptionPlan.findUnique({
      where: { id: planId },
    })

    if (!plan) {
      return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 })
    }

    // Verificar se o usuário já tem um customer no Stripe
    let stripeCustomerId: string | undefined

    // Buscar customer existente pelo email
    const existingCustomers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    })

    if (existingCustomers.data.length > 0) {
      stripeCustomerId = existingCustomers.data[0].id
    } else {
      // Criar novo customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id,
          clerkId: userId,
        },
      })
      stripeCustomerId = customer.id
    }

    // Cancelar assinatura ativa anterior se existir
    const activeSubscription = await prismadb.subscription.findFirst({
      where: {
        user_id: user.id,
        status: "ACTIVE",
      },
    })

    if (activeSubscription) {
      await prismadb.subscription.update({
        where: { id: activeSubscription.id },
        data: { status: "CANCELED" },
      })
    }

    // Criar sessão de checkout para subscription
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: plan.name,
              description: plan.features.split("\n").slice(0, 3).join(", "),
            },
            unit_amount: Math.round(plan.price * 100), // Converter para centavos
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/plans/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/plans`,
      metadata: {
        userId: user.id,
        planId: plan.id,
        clerkId: userId,
      },
    })

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    })
  } catch (error) {
    console.error("Erro ao criar checkout:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
