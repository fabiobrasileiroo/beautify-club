import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ServiceForm } from "./service-form"
import { BackButtonStack } from "@/components/back-button-stack"

import prismadb from "@/lib/prisma"

export default async function NewServicePage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  // Buscar usuário e salão do parceiro
  const user = await prismadb.user.findFirst({
    where: {
      clerk_id: userId,
      role: "PARTNER",
    },
    include: {
      salon: true,
    },
  })

  if (!user || !user.salon) {
    redirect("/partner/register")
  }

  const salon = user.salon

  return (
    <div className="space-y-6">
      <BackButtonStack />

      <div>
        <h1 className="text-3xl font-bold text-foreground">Novo Serviço</h1>
        <p className="text-muted-foreground">Adicione um novo serviço ao seu salão</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Serviço</CardTitle>
          <CardDescription>Preencha as informações do serviço que você deseja oferecer</CardDescription>
        </CardHeader>
        <CardContent>
          <ServiceForm salonId={salon.id} />
        </CardContent>
      </Card>
    </div>
  )
}
