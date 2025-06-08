import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prisma"
import PlansClient from "./plans-client"

export default async function PlansPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  // Buscar usuário do banco de dados
  const user = await prismadb.user.findFirst({
    where: {
      clerk_id: userId,
    },
    include: {
      subscriptions: {
        where: {
          status: "ACTIVE",
        },
        include: {
          plan: true,
        },
        orderBy: {
          created_at: "desc",
        },
        take: 1,
      },
    },
  })

  if (!user) {
    redirect("/sign-in")
  }

  // Buscar planos disponíveis
  const plans = await prismadb.subscriptionPlan.findMany({
    orderBy: {
      price: "asc",
    },
  })

  const activeSubscription = user.subscriptions[0]

  return (
    <PlansClient
      plans={plans}
      activeSubscription={activeSubscription}
      isSignedIn={true}
    />
  )
}