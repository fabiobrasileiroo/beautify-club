import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownRight, DollarSign, Calendar, CheckCircle } from "lucide-react"

import prismadb from "@/lib/prisma"

export default async function PartnerFinancesPage() {
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

  // Datas para filtrar
  const currentDate = new Date()
  const currentMonthStart = startOfMonth(currentDate)
  const currentMonthEnd = endOfMonth(currentDate)
  const lastMonthStart = startOfMonth(subMonths(currentDate, 1))
  const lastMonthEnd = endOfMonth(subMonths(currentDate, 1))

  // Buscar agendamentos e comissões
  const currentMonthAppointments = await prismadb.appointment.findMany({
    where: {
      salon_id: salon.id,
      scheduled_at: {
        gte: currentMonthStart,
        lte: currentMonthEnd,
      },
    },
    include: {
      service: true,
      commission: true,
    },
  })

  const lastMonthAppointments = await prismadb.appointment.findMany({
    where: {
      salon_id: salon.id,
      scheduled_at: {
        gte: lastMonthStart,
        lte: lastMonthEnd,
      },
    },
    include: {
      service: true,
      commission: true,
    },
  })

  // Buscar comissões pendentes
  const pendingCommissions = await prismadb.commission.findMany({
    where: {
      salon_id: salon.id,
      paid_flag: false,
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
  })

  // Buscar comissões pagas
  const paidCommissions = await prismadb.commission.findMany({
    where: {
      salon_id: salon.id,
      paid_flag: true,
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
      paid_at: "desc",
    },
    take: 10,
  })

  // Calcular estatísticas
  const currentMonthRevenue = currentMonthAppointments
    .filter((appointment) => appointment.status === "COMPLETED")
    .reduce((sum, appointment) => sum + appointment.price_charged, 0)

  const lastMonthRevenue = lastMonthAppointments
    .filter((appointment) => appointment.status === "COMPLETED")
    .reduce((sum, appointment) => sum + appointment.price_charged, 0)

  const currentMonthCommissions = currentMonthAppointments
    .filter((appointment) => appointment.status === "COMPLETED" && appointment.commission)
    .reduce((sum, appointment) => sum + (appointment.commission?.amount || 0), 0)

  const lastMonthCommissions = lastMonthAppointments
    .filter((appointment) => appointment.status === "COMPLETED" && appointment.commission)
    .reduce((sum, appointment) => sum + (appointment.commission?.amount || 0), 0)

  const totalPendingCommissions = pendingCommissions.reduce((sum, commission) => sum + commission.amount, 0)

  const revenueChange = lastMonthRevenue > 0 ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 100

  const commissionsChange =
    lastMonthCommissions > 0 ? ((currentMonthCommissions - lastMonthCommissions) / lastMonthCommissions) * 100 : 100

  const formatDate = (date: Date) => {
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Finanças</h1>
        <p className="text-muted-foreground">Gerencie as finanças do seu salão</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receita (Mês Atual)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">R$ {currentMonthRevenue.toFixed(2)}</div>
              <div className={`flex items-center ${revenueChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                {revenueChange >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                )}
                <span>{Math.abs(revenueChange).toFixed(1)}%</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Comparado ao mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Comissões (Mês Atual)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">R$ {currentMonthCommissions.toFixed(2)}</div>
              <div className={`flex items-center ${commissionsChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                {commissionsChange >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                )}
                <span>{Math.abs(commissionsChange).toFixed(1)}%</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Comparado ao mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Comissões Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalPendingCommissions.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">{pendingCommissions.length} pagamentos pendentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Conclusão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentMonthAppointments.length > 0
                ? Math.round(
                    (currentMonthAppointments.filter((a) => a.status === "COMPLETED").length /
                      currentMonthAppointments.length) *
                      100,
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground mt-1">Agendamentos concluídos vs. total</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Comissões Pendentes ({pendingCommissions.length})</TabsTrigger>
          <TabsTrigger value="paid">Comissões Pagas ({paidCommissions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingCommissions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <CheckCircle className="h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">Nenhuma comissão pendente</h3>
                <p className="text-muted-foreground text-center mt-1">Todas as suas comissões foram pagas.</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Comissões Pendentes</CardTitle>
                <CardDescription>Comissões que ainda não foram pagas pela plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingCommissions.map((commission) => (
                    <div
                      key={commission.id}
                      className="flex flex-col md:flex-row justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{commission.appointment.service.name}</div>
                        <div className="text-sm text-muted-foreground">Cliente: {commission.appointment.user.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{formatDate(commission.appointment.scheduled_at)}</span>
                        </div>
                      </div>
                      <div className="mt-2 md:mt-0 text-right">
                        <div className="font-medium">R$ {commission.amount.toFixed(2)}</div>
                        <Badge variant="outline" className="mt-1">
                          Pendente
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="paid" className="space-y-4">
          {paidCommissions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <DollarSign className="h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">Nenhuma comissão paga</h3>
                <p className="text-muted-foreground text-center mt-1">Você ainda não recebeu nenhuma comissão.</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Comissões Pagas</CardTitle>
                <CardDescription>Últimas comissões pagas pela plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paidCommissions.map((commission) => (
                    <div
                      key={commission.id}
                      className="flex flex-col md:flex-row justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{commission.appointment.service.name}</div>
                        <div className="text-sm text-muted-foreground">Cliente: {commission.appointment.user.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{formatDate(commission.appointment.scheduled_at)}</span>
                        </div>
                      </div>
                      <div className="mt-2 md:mt-0 text-right">
                        <div className="font-medium">R$ {commission.amount.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">
                          Pago em {commission.paid_at ? formatDate(commission.paid_at) : "N/A"}
                        </div>
                        <Badge variant="success" className="mt-1">
                          Pago
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Configurações de Pagamento</CardTitle>
          <CardDescription>Configure suas informações de pagamento para receber comissões</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Chave PIX</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-muted-foreground">
                    {salon.pix_key ? salon.pix_key : "Nenhuma chave PIX cadastrada"}
                  </p>
                  {salon.pix_key_type && <p className="text-xs text-muted-foreground">Tipo: {salon.pix_key_type}</p>}
                </div>
                <Button variant="outline">{salon.pix_key ? "Atualizar" : "Adicionar"}</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
