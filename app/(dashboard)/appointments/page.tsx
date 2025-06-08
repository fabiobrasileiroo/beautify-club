"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import prismadb from "@/lib/prisma"
import { AppointmentsClient } from "./appointments-client"

export default async function AppointmentsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  // Buscar usuário do banco de dados
  const user = await prismadb.user.findFirst({
    where: {
      clerk_id: userId,
    },
  })

  if (!user) {
    redirect("/sign-in")
  }

  // Buscar agendamentos do usuário
  const appointments = await prismadb.appointment.findMany({
    where: {
      user_id: user.id,
    },
    include: {
      service: true,
      salon: true,
    },
    orderBy: {
      scheduled_at: "desc",
    },
  })

  return <AppointmentsClient appointments={appointments} />
}
