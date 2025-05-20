import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, DollarSign, Download } from "lucide-react"

import prismadb from "@/lib/prisma"

export default async function PartnerFinancesPage() {
  const { userId } = await auth()
  const user = await currentUser()

  if (!userId || !user) {
    redirect("/sign-in")
  }

  // Verificar se o usuário é um parceiro
  const dbUser = await prismadb.user.findUnique({
    where: {
      clerk_id: userId,
    },
    include: {
      salon: true,
    },
  })

  if (!dbUser || dbUser.role !== "PARTNER" || !dbUser.salon) {
    redirect("/partner/register")
  }

  // Buscar comissões do salão
  const commissions = await prismadb.commission.findMany({
    where: {
      salon_id: dbUser.salon.id,
    },
    include: {
      appointment: {
        include: {
          service: true,
          user: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
    take: 10,
  })

  // Calcular estatísticas financeiras
  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  // Calcular total de comissões do mês
  const monthlyCommissions = await prismadb.commission.aggregate({
    where: {
      salon_id: dbUser.salon.id,
      created_at: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    _sum: {
      amount: true,
    },
  })

  // Calcular total de comissões pendentes
  const pendingCommissions = await prismadb.commission.aggregate({
    where: {
      salon_id: dbUser.salon.id,
      paid_flag: false,
    },
    _sum: {
      amount: true,
    },
  })

  // Calcular total de comissões pagas
  const paidCommissions = await prismadb.commission.aggregate({
    where: {
      salon_id: dbUser.salon.id,
      paid_flag: true,
    },
    _sum: {
      amount: true,
    },
  })

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Finanças</h1>
          <p className="text-muted-foreground">Gerencie suas comissões e pagamentos</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar relatório
          </Button>
          <Button variant="accent" className="text-white">
            Solicitar saque
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Comissões do mês</CardTitle>
            <CardDescription>Total de {new Date().toLocaleString("pt-BR", { month: "long" })}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-muted-foreground mr-2" />
              <span className="text-2xl font-bold">R${monthlyCommissions._sum.amount?.toFixed(2) || "0.00"}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Disponível para saque</CardTitle>
            <CardDescription>Comissões pendentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-muted-foreground mr-2" />
              <span className="text-2xl font-bold">R${pendingCommissions._sum.amount?.toFixed(2) || "0.00"}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total recebido</CardTitle>
            <CardDescription>Comissões já pagas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-muted-foreground mr-2" />
              <span className="text-2xl font-bold">R${paidCommissions._sum.amount?.toFixed(2) || "0.00"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações de pagamento</CardTitle>
          <CardDescription>Seus dados para recebimento de comissões</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Chave PIX</h3>
                <div className="bg-secondary p-4 rounded-lg">
                  <p>
                    <strong>Tipo:</strong> {dbUser.salon.pix_key_type || "Não configurado"}
                  </p>
                  <p>
                    <strong>Chave:</strong> {dbUser.salon.pix_key || "Não configurada"}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Política de pagamentos</h3>
                <p className="text-sm text-muted-foreground">
                  Os pagamentos são processados automaticamente todo dia 15 de cada mês para valores acima de R$50,00.
                  Você também pode solicitar saques manuais a qualquer momento para valores acima de R$20,00.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline">Atualizar dados de pagamento</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de comissões</CardTitle>
          <CardDescription>Últimas comissões recebidas</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="pending">Pendentes</TabsTrigger>
              <TabsTrigger value="paid">Pagas</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <div className="space-y-4">
                {commissions.length > 0 ? (
                  commissions.map((commission) => (
                    <div
                      key={commission.id}
                      className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium">{commission.appointment.service.name}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{new Date(commission.created_at).toLocaleDateString("pt-BR")}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span>Cliente: {commission.appointment.user.name}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">R${commission.amount.toFixed(2)}</p>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            commission.paid_flag ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {commission.paid_flag ? "Pago" : "Pendente"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">Nenhuma comissão registrada.</p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="pending">
              <div className="space-y-4">
                {commissions.filter((c) => !c.paid_flag).length > 0 ? (
                  commissions
                    .filter((c) => !c.paid_flag)
                    .map((commission) => (
                      <div
                        key={commission.id}
                        className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0"
                      >
                        <div>
                          <p className="font-medium">{commission.appointment.service.name}</p>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{new Date(commission.created_at).toLocaleDateString("pt-BR")}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <span>Cliente: {commission.appointment.user.name}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">R${commission.amount.toFixed(2)}</p>
                          <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Pendente</span>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-muted-foreground">Nenhuma comissão pendente.</p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="paid">
              <div className="space-y-4">
                {commissions.filter((c) => c.paid_flag).length > 0 ? (
                  commissions
                    .filter((c) => c.paid_flag)
                    .map((commission) => (
                      <div
                        key={commission.id}
                        className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0"
                      >
                        <div>
                          <p className="font-medium">{commission.appointment.service.name}</p>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{new Date(commission.created_at).toLocaleDateString("pt-BR")}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <span>Cliente: {commission.appointment.user.name}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">R${commission.amount.toFixed(2)}</p>
                          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Pago</span>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-muted-foreground">Nenhuma comissão paga.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
          <div className="mt-6 flex justify-center">
            <Button variant="outline">Ver todas as comissões</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
