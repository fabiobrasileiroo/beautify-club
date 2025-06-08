import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import SuccessClient from "./success-client"
import prismadb from "@/lib/prisma"

interface SuccessPageProps {
  searchParams: {
    session_id?: string
  }
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { userId } = await auth()
  const sessionId = searchParams.session_id

  if (!userId || !sessionId) {
    redirect("/plans")
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

  if (!user || user.subscriptions.length === 0) {
    redirect("/plans")
  }

  const subscription = user.subscriptions[0]

  return <SuccessClient subscription={subscription} />
}