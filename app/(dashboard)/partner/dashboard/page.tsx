import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { auth, currentUser } from "@clerk/nextjs/server"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, DollarSign, Users } from "lucide-react"

import prismadb from "@/lib/prisma"

export default async function PartnerDashboardPage() {
  const { userId } = auth()
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

  // Buscar agendamentos do salão
  const appointments = await prismadb.appointment.findMany({
    where: {
      salon_id: dbUser.salon.id,
    },
    include: {
      user: true,
      service: true,
    },
    orderBy: {
      scheduled_at: "desc",
    },
    take: 5,
  })

  // Buscar comissões do salão
  const commissions = await prismadb.commission.findMany({
    where: {
      salon_id: dbUser.salon.id,
    },
    include: {
      appointment: {
        include: {
          service: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
    take: 5,
  })

  // Calcular estatísticas
  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  const appointmentsThisMonth = await prismadb.appointment.count({
    where: {
      salon_id: dbUser.salon.id,
      scheduled_at: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  })

  const totalCommission = await prismadb.commission.aggregate({
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

  const uniqueClients = await prismadb.appointment.findMany({
    where: {
      salon_id: dbUser.salon.id,
      scheduled_at: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    select: {
      user_id: true,
    },
    distinct: ["user_id"],
  })

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard do Parceiro</h1>
          <p className="text-muted-foreground">Bem-vindo(a), {dbUser.salon.name}</p>
        </div>
        <div className="flex gap-4">
          <Link href="/partner/services">
            <Button variant="outline">Gerenciar serviços</Button>
          </Link>
          <Link href="/partner/appointments">
            <Button variant="accent" className="text-white">
              Ver agendamentos
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
            <CardDescription>Este mês</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-muted-foreground mr-2" />
              <span className="text-2xl font-bold">{appointmentsThisMonth}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Receita</CardTitle>
            <CardDescription>Este mês</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-muted-foreground mr-2" />
              <span className="text-2xl font-bold">R${totalCommission._sum.amount?.toFixed(2) || "0.00"}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <CardDescription>Este mês</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-muted-foreground mr-2" />
              <span className="text-2xl font-bold">{uniqueClients.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taxa de ocupação</CardTitle>
            <CardDescription>Este mês</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-muted-foreground mr-2" />
              <span className="text-2xl font-bold">78%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Agendamentos recentes</CardTitle>
            <CardDescription>Últimos 5 agendamentos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">{appointment.service.name}</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{new Date(appointment.scheduled_at).toLocaleDateString("pt-BR")}</span>
                        <Clock className="h-3 w-3 ml-2 mr-1" />
                        <span>
                          {new Date(appointment.scheduled_at).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span>Cliente: {appointment.user.name}</span>
                      </div>
                    </div>
                    <div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          appointment.status === "SCHEDULED"
                            ? "bg-blue-100 text-blue-800"
                            : appointment.status === "COMPLETED"
                              ? "bg-green-100 text-green-800"
                              : appointment.status === "CANCELED"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {appointment.status === "SCHEDULED"
                          ? "Agendado"
                          : appointment.status === "COMPLETED"
                            ? "Concluído"
                            : appointment.status === "CANCELED"
                              ? "Cancelado"
                              : "Não compareceu"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">Nenhum agendamento recente.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comissões recentes</CardTitle>
            <CardDescription>Últimos 5 pagamentos</CardDescription>
          </CardHeader>
          <CardContent>
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
                        <span>ID: {commission.id.slice(0, 8)}</span>
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
                <p className="text-muted-foreground">Nenhuma comissão recente.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Análise de desempenho</CardTitle>
          <CardDescription>Visão geral dos últimos 30 dias</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="appointments">
            <TabsList className="mb-4">
              <TabsTrigger value="appointments">Agendamentos</TabsTrigger>
              <TabsTrigger value="revenue">Receita</TabsTrigger>
              <TabsTrigger value="clients">Clientes</TabsTrigger>
            </TabsList>
            <TabsContent value="appointments">
              <div className="h-80 bg-secondary rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">Gráfico de agendamentos por dia</p>
              </div>
            </TabsContent>
            <TabsContent value="revenue">
              <div className="h-80 bg-secondary rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">Gráfico de receita por dia</p>
              </div>
            </TabsContent>
            <TabsContent value="clients">
              <div className="h-80 bg-secondary rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">Gráfico de novos clientes por dia</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
