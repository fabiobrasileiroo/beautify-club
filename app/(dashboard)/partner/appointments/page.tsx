import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, User, DollarSign } from "lucide-react"

import prismadb from "@/lib/prisma"

const statusMap = {
  SCHEDULED: { label: "Agendado", variant: "outline" },
  COMPLETED: { label: "Concluído", variant: "success" },
  CANCELED: { label: "Cancelado", variant: "destructive" },
  NO_SHOW: { label: "Não compareceu", variant: "destructive" },
}

function formatDate(date: Date) {
  return format(new Date(date), "PPP", { locale: ptBR })
}

function formatTime(date: Date) {
  return format(new Date(date), "HH:mm")
}

export default async function PartnerAppointmentsPage() {
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

  // Buscar agendamentos do salão
  const appointments = await prismadb.appointment.findMany({
    where: {
      salon_id: salon.id,
    },
    include: {
      service: true,
      user: true,
      commission: true,
    },
    orderBy: {
      scheduled_at: "asc",
    },
  })

  // Separar agendamentos por data
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const todayAppointments = appointments.filter((appointment) => {
    const appointmentDate = new Date(appointment.scheduled_at)
    appointmentDate.setHours(0, 0, 0, 0)
    return appointmentDate.getTime() === today.getTime() && appointment.status === "SCHEDULED"
  })

  const upcomingAppointments = appointments.filter((appointment) => {
    const appointmentDate = new Date(appointment.scheduled_at)
    appointmentDate.setHours(0, 0, 0, 0)
    return appointmentDate.getTime() > today.getTime() && appointment.status === "SCHEDULED"
  })

  const pastAppointments = appointments.filter(
    (appointment) => appointment.status !== "SCHEDULED" || new Date(appointment.scheduled_at) < today,
  )

  // Calcular estatísticas
  const totalAppointments = appointments.length
  const completedAppointments = appointments.filter((appointment) => appointment.status === "COMPLETED").length
  const canceledAppointments = appointments.filter((appointment) => appointment.status === "CANCELED").length
  const totalRevenue = appointments
    .filter((appointment) => appointment.status === "COMPLETED")
    .reduce((sum, appointment) => sum + appointment.price_charged, 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Agendamentos</h1>
        <p className="text-muted-foreground">Gerencie os agendamentos do seu salão</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Agendamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAppointments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Agendamentos Concluídos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedAppointments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Agendamentos Cancelados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{canceledAppointments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receita Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">Hoje ({todayAppointments.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Próximos ({upcomingAppointments.length})</TabsTrigger>
          <TabsTrigger value="past">Histórico ({pastAppointments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          {todayAppointments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Calendar className="h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">Nenhum agendamento para hoje</h3>
                <p className="text-muted-foreground text-center mt-1">Você não possui agendamentos para hoje.</p>
              </CardContent>
            </Card>
          ) : (
            todayAppointments.map((appointment) => (
              <PartnerAppointmentCard key={appointment.id} appointment={appointment} isManageable />
            ))
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingAppointments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Clock className="h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">Nenhum agendamento futuro</h3>
                <p className="text-muted-foreground text-center mt-1">Você não possui agendamentos futuros.</p>
              </CardContent>
            </Card>
          ) : (
            upcomingAppointments.map((appointment) => (
              <PartnerAppointmentCard key={appointment.id} appointment={appointment} isManageable />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastAppointments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Clock className="h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">Nenhum histórico de agendamento</h3>
                <p className="text-muted-foreground text-center mt-1">
                  Você ainda não possui histórico de agendamentos.
                </p>
              </CardContent>
            </Card>
          ) : (
            pastAppointments.map((appointment) => (
              <PartnerAppointmentCard key={appointment.id} appointment={appointment} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function PartnerAppointmentCard({ appointment, isManageable = false }) {
  const status = statusMap[appointment.status] || statusMap.SCHEDULED

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-medium">{appointment.service.name}</h3>
              <Badge variant={status.variant as "outline" | "destructive" | "success"}>{status.label}</Badge>
            </div>

            <div className="flex items-center text-muted-foreground">
              <User className="h-4 w-4 mr-2" />
              <span>{appointment.user.name}</span>
            </div>

            <div className="flex items-center text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              <span>
                {formatDate(appointment.scheduled_at)} às {formatTime(appointment.scheduled_at)}
              </span>
            </div>

            <div className="flex items-center text-muted-foreground">
              <Clock className="h-4 w-4 mr-2" />
              <span>Duração: {appointment.service.duration_min} minutos</span>
            </div>
          </div>

          <div className="flex flex-col items-end justify-between">
            <div className="text-right">
              <div className="text-lg font-bold">R$ {appointment.price_charged.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-end">
                <DollarSign className="h-3 w-3 mr-1" />
                <span>Comissão: R$ {appointment.commission?.amount.toFixed(2) || "0.00"}</span>
              </div>
            </div>

            {isManageable && appointment.status === "SCHEDULED" && (
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm">
                  Reagendar
                </Button>
                <Button variant="success" size="sm">
                  Concluir
                </Button>
                <Button variant="destructive" size="sm">
                  Cancelar
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
