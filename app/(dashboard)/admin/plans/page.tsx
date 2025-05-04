import Link from "next/link"
import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Plus, Trash } from "lucide-react"

import prismadb from "@/lib/prisma"

export default async function AdminPlansPage() {
  const { userId } = auth()
  const user = await currentUser()

  if (!userId || !user) {
    redirect("/sign-in")
  }

  // Verificar se o usuário é um administrador
  const dbUser = await prismadb.user.findUnique({
    where: {
      clerk_id: userId,
    },
  })

  if (!dbUser || dbUser.role !== "ADMIN") {
    redirect("/dashboard")
  }

  // Buscar planos
  const plans = await prismadb.subscriptionPlan.findMany({
    orderBy: {
      price: "asc",
    },
  })

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gerenciar Planos</h1>
          <p className="text-muted-foreground">Configure os planos de assinatura disponíveis</p>
        </div>
        <Link href="/admin/plans/new">
          <Button variant="accent" className="text-white">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar plano
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Planos de assinatura</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {plans.length > 0 ? (
              plans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6 last:border-0 last:pb-0"
                >
                  <div>
                    <h3 className="font-medium text-lg">{plan.name}</h3>
                    <p className="text-muted-foreground">
                      {plan.max_services_per_month
                        ? `${plan.max_services_per_month} serviços por mês`
                        : "Serviços ilimitados"}
                    </p>
                    <div className="mt-2">
                      <h4 className="text-sm font-medium mb-1">Recursos:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {plan.features.split("\n").map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row items-end md:items-center gap-4">
                    <span className="text-lg font-bold">R${plan.price.toFixed(2)}/mês</span>
                    <div className="flex gap-2">
                      <Link href={`/admin/plans/${plan.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                      </Link>
                      <Button variant="destructive" size="sm">
                        <Trash className="h-4 w-4 mr-2" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-2">Nenhum plano cadastrado</h3>
                <p className="text-muted-foreground mb-6">Adicione planos para que os clientes possam assinar.</p>
                <Link href="/admin/plans/new">
                  <Button variant="accent" className="text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar plano
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estatísticas de planos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.id} className="bg-secondary rounded-lg p-6">
                <h3 className="font-bold text-lg mb-2">{plan.name}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Assinantes ativos:</span>
                    <span className="font-medium">247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Receita mensal:</span>
                    <span className="font-medium">R${(plan.price * 247).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxa de conversão:</span>
                    <span className="font-medium">12.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxa de churn:</span>
                    <span className="font-medium">3.2%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
