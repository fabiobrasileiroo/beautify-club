import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { PrismaClient } from "@prisma/client"
import Stripe from "stripe"

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
})

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
    }

    // Obter dados da requisição
    const { subscriptionId } = await request.json()

    if (!subscriptionId) {
      return NextResponse.json({ error: "ID da assinatura é obrigatório" }, { status: 400 })
    }

    // Buscar o usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: { clerk_id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Buscar a assinatura e verificar se pertence ao usuário
    const subscription = await prisma.subscription.findFirst({
      where: {
        id: subscriptionId,
        user_id: user.id,
        status: "ACTIVE",
      },
      include: {
        plan: true,
      },
    })

    if (!subscription) {
      return NextResponse.json(
        {
          error: "Assinatura não encontrada ou já foi cancelada",
        },
        { status: 404 },
      )
    }

    // Verificar se a assinatura ainda está dentro do período ativo
    const now = new Date()
    if (subscription.end_date < now) {
      return NextResponse.json(
        {
          error: "Esta assinatura já expirou",
        },
        { status: 400 },
      )
    }

    try {
      // Buscar customer no Stripe pelo email do usuário
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      })

      if (customers.data.length > 0) {
        const customer = customers.data[0]

        // Buscar assinaturas ativas do customer
        const stripeSubscriptions = await stripe.subscriptions.list({
          customer: customer.id,
          status: "active",
          limit: 10,
        })

        // Cancelar assinatura no Stripe (no final do período)
        for (const stripeSub of stripeSubscriptions.data) {
          await stripe.subscriptions.update(stripeSub.id, {
            cancel_at_period_end: true,
          })
          console.log(`Assinatura Stripe ${stripeSub.id} marcada para cancelamento no final do período`)
        }
      }
    } catch (stripeError) {
      console.error("Erro ao cancelar no Stripe:", stripeError)
      // Continuar com o cancelamento local mesmo se houver erro no Stripe
    }

    // Atualizar o status da assinatura para CANCELED no banco local
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: "CANCELED",
        updated_at: new Date(),
      },
      include: {
        plan: true,
      },
    })

    // Log da ação
    console.log(`Assinatura cancelada: ${subscriptionId} - Usuário: ${user.email} - Plano: ${subscription.plan.name}`)

    return NextResponse.json({
      message: "Assinatura cancelada com sucesso",
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        end_date: updatedSubscription.end_date,
        plan_name: updatedSubscription.plan.name,
      },
    })
  } catch (error) {
    console.error("Erro ao cancelar assinatura:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
