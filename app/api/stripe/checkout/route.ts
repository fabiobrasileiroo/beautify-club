import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import Stripe from "stripe"

import prismadb from "@/lib/prisma"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
})

export async function POST(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const { planId } = body

    // Buscar usuário no banco
    const user = await prismadb.user.findFirst({
      where: {
        clerk_id: userId,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Buscar plano no banco de dados
    const plan = await prismadb.subscriptionPlan.findUnique({
      where: {
        id: planId,
      },
    })

    if (!plan) {
      return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 })
    }

    // Criar checkout session
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: `Plano ${plan.name}`,
              description: plan.max_services_per_month
                ? `${plan.max_services_per_month} serviços por mês`
                : "Serviços ilimitados",
            },
            unit_amount: Math.round(plan.price * 100), // Stripe usa centavos
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
        planId: plan.id,
      },
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/plans/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/plans`,
      payment_method_types: ["card", "boleto"],
      billing_address_collection: "required",
      customer_email: user.email,
      locale: "pt-BR",
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Erro ao criar sessão de checkout:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
