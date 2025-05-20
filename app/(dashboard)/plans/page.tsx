import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

import prismadb from "@/lib/prisma"

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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Planos de Assinatura</h1>
        <p className="text-muted-foreground">Escolha o plano ideal para suas necessidades</p>
      </div>

      {activeSubscription && (
        <Card className="bg-secondary">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold">Seu plano atual: {activeSubscription.plan.name}</h2>
                <p className="text-muted-foreground">
                  Próxima cobrança em {new Date(activeSubscription.end_date).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <Button variant="outline">Cancelar assinatura</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const isActive = activeSubscription?.plan_id === plan.id

          return (
            <Card key={plan.id} className={`overflow-hidden ${plan.name === "Padrão" ? "border-accent" : ""}`}>
              <CardHeader className={`pb-8 ${plan.name === "Padrão" ? "bg-accent text-white" : "bg-secondary"}`}>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4 flex items-baseline">
                  <span
                    className={`text-5xl font-extrabold ${plan.name === "Padrão" ? "text-white" : "text-foreground"}`}
                  >
                    R${plan.price.toFixed(2)}
                  </span>
                  <span
                    className={`ml-1 text-xl ${plan.name === "Padrão" ? "text-white/80" : "text-muted-foreground"}`}
                  >
                    /mês
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-4">
                  {plan.features.split("\n").map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-accent mr-2 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pb-6 px-6">
                {isActive ? (
                  <Button variant="outline" className="w-full" disabled>
                    Plano atual
                  </Button>
                ) : (
                  <Button
                    variant={plan.name === "Padrão" ? "accent" : "outline"}
                    className={`w-full ${plan.name === "Padrão" ? "text-white" : ""}`}
                  >
                    {activeSubscription ? "Mudar para este plano" : "Assinar agora"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Perguntas frequentes</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="font-bold mb-2">Como funciona a assinatura?</h3>
              <p className="text-muted-foreground">
                Ao assinar um plano, você terá acesso a serviços em todos os salões e barbearias parceiros. O valor é
                cobrado mensalmente e você pode cancelar a qualquer momento.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Posso trocar de plano?</h3>
              <p className="text-muted-foreground">
                Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento. A mudança será aplicada no
                próximo ciclo de cobrança.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Como funciona o limite de serviços?</h3>
              <p className="text-muted-foreground">
                Cada plano tem um limite mensal de serviços que você pode utilizar. O plano Premium oferece serviços
                ilimitados, enquanto os planos Básico e Padrão têm limites específicos.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Como cancelar minha assinatura?</h3>
              <p className="text-muted-foreground">
                Você pode cancelar sua assinatura a qualquer momento através da sua conta. O acesso aos serviços
                continuará disponível até o final do período pago.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
