"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, Scissors } from "lucide-react"
import { useRouter } from "next/navigation"

const statusMap = {
  SCHEDULED: { label: "Agendado", variant: "outline" as const },
  COMPLETED: { label: "Concluído", variant: "secondary" as const },
  CANCELED: { label: "Cancelado", variant: "destructive" as const },
  NO_SHOW: { label: "Não compareceu", variant: "destructive" as const },
}

const formatDate = (date: Date) => {
  return format(new Date(date), "PPP", { locale: ptBR })
}

const formatTime = (date: Date) => {
  return format(new Date(date), "HH:mm")
}

interface AppointmentsClientProps {
  appointments: any[]
}

export function AppointmentsClient({ appointments }: AppointmentsClientProps) {
  const router = useRouter()

  // Separar agendamentos por status
  const upcoming = appointments.filter(
    (appointment) => appointment.status === "SCHEDULED" && new Date(appointment.scheduled_at) > new Date(),
  )
  const past = appointments.filter(
    (appointment) => appointment.status !== "SCHEDULED" || new Date(appointment.scheduled_at) <= new Date(),
  )

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/cancel`, {
        method: "PATCH",
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Erro ao cancelar agendamento:", error)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Meus Agendamentos</h1>
        <p className="text-muted-foreground">Gerencie seus agendamentos em salões e barbearias</p>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Próximos ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Histórico ({past.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcoming.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Calendar className="h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">Nenhum agendamento próximo</h3>
                <p className="text-muted-foreground text-center mt-1">
                  Você não possui agendamentos futuros. Explore salões e agende um serviço.
                </p>
                <Button className="mt-4" onClick={() => router.push("/salons")}>
                  Explorar salões
                </Button>
              </CardContent>
            </Card>
          ) : (
            upcoming.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                isUpcoming
                onCancel={() => handleCancelAppointment(appointment.id)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {past.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Clock className="h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">Nenhum histórico de agendamento</h3>
                <p className="text-muted-foreground text-center mt-1">
                  Você ainda não realizou nenhum agendamento. Explore salões e agende um serviço.
                </p>
                <Button className="mt-4" onClick={() => router.push("/salons")}>
                  Explorar salões
                </Button>
              </CardContent>
            </Card>
          ) : (
            past.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface AppointmentCardProps {
  appointment: any
  isUpcoming?: boolean
  onCancel?: () => void
}

function AppointmentCard({ appointment, isUpcoming = false, onCancel }: AppointmentCardProps) {
  const status = statusMap[appointment.status] || statusMap.SCHEDULED

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-medium">{appointment.service.name}</h3>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>

            <div className="flex items-center text-muted-foreground">
              <Scissors className="h-4 w-4 mr-2" />
              <span>{appointment.salon.name}</span>
            </div>

            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{appointment.salon.address}</span>
            </div>

            <div className="flex items-center text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              <span>
                {formatDate(appointment.scheduled_at)} às {formatTime(appointment.scheduled_at)}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end justify-between">
            <div className="text-right">
              <div className="text-lg font-bold">R$ {appointment.price_charged.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Duração: {appointment.service.duration_min} minutos</div>
            </div>

            {isUpcoming && (
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm">
                  Reagendar
                </Button>
                <Button variant="destructive" size="sm" onClick={onCancel}>
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
