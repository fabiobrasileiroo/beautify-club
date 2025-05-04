import Link from "next/link"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, Scissors } from "lucide-react"

import prismadb from "@/lib/prisma"

export default async function AppointmentsPage() {
  const { userId } = auth()

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
      salon: true,
      service: true,
    },
    orderBy: {
      scheduled_at: "desc",
    },
  })

  // Separar agendamentos por status
  const upcomingAppointments = appointments.filter(
    (appointment) => appointment.status === "SCHEDULED" && new Date(appointment.scheduled_at) > new Date(),
  )

  const pastAppointments = appointments.filter(
    (appointment) =>
      appointment.status === "COMPLETED" ||
      (appointment.status === "SCHEDULED" && new Date(appointment.scheduled_at) <= new Date()),
  )

  const canceledAppointments = appointments.filter(
    (appointment) => appointment.status === "CANCELED" || appointment.status === "NO_SHOW",
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meus Agendamentos</h1>
          <p className="text-muted-foreground">Gerencie seus serviços agendados</p>
        </div>
        <Link href="/salons">
          <Button variant="accent" className="text-white">
            Agendar novo serviço
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="upcoming">Próximos ({upcomingAppointments.length})</TabsTrigger>
          <TabsTrigger value="past">Realizados ({pastAppointments.length})</TabsTrigger>
          <TabsTrigger value="canceled">Cancelados ({canceledAppointments.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="space-y-6">
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">{appointment.service.name}</h3>
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
                        <span>{new Date(appointment.scheduled_at).toLocaleDateString("pt-BR")}</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>
                          {new Date(appointment.scheduled_at).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col justify-between items-end">
                      <div className="text-right">
                        <span className="text-lg font-bold">R${appointment.price_charged.toFixed(2)}</span>
                        <p className="text-xs text-muted-foreground">via assinatura</p>
                      </div>
                      <div className="flex gap-2 mt-4 md:mt-0">
                        <Button variant="outline" size="sm">
                          Reagendar
                        </Button>
                        <Button variant="destructive" size="sm">
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">Nenhum agendamento próximo</h3>
              <p className="text-muted-foreground mb-6">Você não possui agendamentos futuros.</p>
              <Link href="/salons">
                <Button variant="accent" className="text-white">
                  Agendar serviço
                </Button>
              </Link>
            </div>
          )}
        </TabsContent>
        <TabsContent value="past" className="space-y-6">
          {pastAppointments.length > 0 ? (
            pastAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">{appointment.service.name}</h3>
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
                        <span>{new Date(appointment.scheduled_at).toLocaleDateString("pt-BR")}</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>
                          {new Date(appointment.scheduled_at).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col justify-between items-end">
                      <div className="text-right">
                        <span className="text-lg font-bold">R${appointment.price_charged.toFixed(2)}</span>
                        <p className="text-xs text-muted-foreground">via assinatura</p>
                      </div>
                      <Button variant="outline" size="sm" className="mt-4 md:mt-0">
                        Avaliar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">Nenhum agendamento realizado</h3>
              <p className="text-muted-foreground">Você ainda não realizou nenhum serviço.</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="canceled" className="space-y-6">
          {canceledAppointments.length > 0 ? (
            canceledAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">{appointment.service.name}</h3>
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
                        <span>{new Date(appointment.scheduled_at).toLocaleDateString("pt-BR")}</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>
                          {new Date(appointment.scheduled_at).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col justify-between items-end">
                      <div className="text-right">
                        <span className="text-lg font-bold">R${appointment.price_charged.toFixed(2)}</span>
                        <p className="text-xs text-muted-foreground">via assinatura</p>
                      </div>
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs mt-4 md:mt-0">
                        {appointment.status === "CANCELED" ? "Cancelado" : "Não compareceu"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">Nenhum agendamento cancelado</h3>
              <p className="text-muted-foreground">Você não possui agendamentos cancelados.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
