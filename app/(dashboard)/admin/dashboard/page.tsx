import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, DollarSign, Store, Users } from "lucide-react"

import prismadb from "@/lib/prisma"

export default async function AdminDashboardPage() {
  const { userId } = await auth()
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

  // Buscar estatísticas
  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  const totalUsers = await prismadb.user.count({
    where: {
      role: "CLIENT",
    },
  })

  const newUsersThisMonth = await prismadb.user.count({
    where: {
      role: "CLIENT",
      created_at: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  })

  const totalPartners = await prismadb.salon.count()

  const pendingPartners = await prismadb.salon.count({
    where: {
      status: "PENDING",
    },
  })

  const totalSubscriptions = await prismadb.subscription.count({
    where: {
      status: "ACTIVE",
    },
  })

  const totalRevenue = await prismadb.payment.aggregate({
    where: {
      status: "COMPLETED",
      created_at: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    _sum: {
      amount: true,
    },
  })

  const totalAppointments = await prismadb.appointment.count({
    where: {
      scheduled_at: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  })

  // Buscar parceiros pendentes
  const pendingPartnersList = await prismadb.salon.findMany({
    where: {
      status: "PENDING",
    },
    include: {
      user: true,
    },
    take: 5,
  })

  // Buscar assinaturas recentes
  const recentSubscriptions = await prismadb.subscription.findMany({
    include: {
      user: true,
      plan: true,
    },
    orderBy: {
      created_at: "desc",
    },
    take: 5,
  })

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Administrativo</h1>
          <p className="text-muted-foreground">Visão geral da plataforma</p>
        </div>
        <div className="flex gap-4">
          <Link href="/admin/partners">
            <Button variant="outline">Gerenciar parceiros</Button>
          </Link>
          <Link href="/admin/plans">
            <Button variant="accent" className="text-white">
              Gerenciar planos
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Usuários</CardTitle>
            <CardDescription>Total / Novos este mês</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-muted-foreground mr-2" />
              <span className="text-2xl font-bold">{totalUsers}</span>
              <span className="text-sm text-green-600 ml-2">+{newUsersThisMonth}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Parceiros</CardTitle>
            <CardDescription>Total / Pendentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Store className="h-5 w-5 text-muted-foreground mr-2" />
              <span className="text-2xl font-bold">{totalPartners}</span>
              <span className="text-sm text-yellow-600 ml-2">{pendingPartners} pendentes</span>
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
              <span className="text-2xl font-bold">R${totalRevenue._sum.amount?.toFixed(2) || "0.00"}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
            <CardDescription>Este mês</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-muted-foreground mr-2" />
              <span className="text-2xl font-bold">{totalAppointments}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Parceiros pendentes</CardTitle>
            <CardDescription>Aguardando aprovação</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingPartnersList.length > 0 ? (
                pendingPartnersList.map((salon) => (
                  <div
                    key={salon.id}
                    className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">{salon.name}</p>
                      <div className="text-sm text-muted-foreground">
                        <span>Proprietário: {salon.user.name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span>Endereço: {salon.address}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Ver detalhes
                      </Button>
                      <Button variant="accent" size="sm" className="text-white">
                        Aprovar
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">Nenhum parceiro pendente.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assinaturas recentes</CardTitle>
            <CardDescription>Últimas 5 assinaturas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSubscriptions.length > 0 ? (
                recentSubscriptions.map((subscription) => (
                  <div
                    key={subscription.id}
                    className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">{subscription.user.name}</p>
                      <div className="text-sm text-muted-foreground">
                        <span>Plano: {subscription.plan.name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span>Data: {new Date(subscription.created_at).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">R${subscription.plan.price.toFixed(2)}/mês</p>
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Ativo</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">Nenhuma assinatura recente.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Métricas de negócio</CardTitle>
          <CardDescription>Visão geral dos últimos 6 meses</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="mrr">
            <TabsList className="mb-4">
              <TabsTrigger value="mrr">MRR</TabsTrigger>
              <TabsTrigger value="churn">Churn</TabsTrigger>
              <TabsTrigger value="users">Usuários</TabsTrigger>
              <TabsTrigger value="appointments">Agendamentos</TabsTrigger>
            </TabsList>
            <TabsContent value="mrr">
              <div className="h-80 bg-secondary rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">Gráfico de receita recorrente mensal</p>
              </div>
            </TabsContent>
            <TabsContent value="churn">
              <div className="h-80 bg-secondary rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">Gráfico de taxa de cancelamento</p>
              </div>
            </TabsContent>
            <TabsContent value="users">
              <div className="h-80 bg-secondary rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">Gráfico de crescimento de usuários</p>
              </div>
            </TabsContent>
            <TabsContent value="appointments">
              <div className="h-80 bg-secondary rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">Gráfico de agendamentos por mês</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
