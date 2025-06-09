"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Scissors, UserPlus } from "lucide-react"
import Image from "next/image" 

interface DashboardClientProps {
  user: any
  activeSubscription: any
  recentAppointments: any[]
  remainingServices: number
  appointmentsThisMonth: number
  recommendedSalons: any[]
}

export function DashboardClient({
  user,
  activeSubscription,
  recentAppointments,
  remainingServices,
  appointmentsThisMonth,
  recommendedSalons,
}: DashboardClientProps) {
  const router = useRouter()

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Bem-vindo(a), {user?.name}</p>
        </div>
        <div className="flex gap-4">
          <Link href="/salons">
            <Button variant="default" className="font-medium">
              Encontrar salões
            </Button>
          </Link>
          <Link href="/appointments/new">
            <Button variant="outline">Agendar serviço</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Assinatura</CardTitle>
            <CardDescription>Seu plano atual</CardDescription>
          </CardHeader>
          <CardContent>
            {activeSubscription ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-lg">{activeSubscription.plan.name}</span>
                  <span className="text-primary font-bold">R${activeSubscription.plan.price}/mês</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Próxima cobrança</span>
                    <span>{new Date(activeSubscription.end_date).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Serviços restantes</span>
                    <span>
                      {activeSubscription.plan.max_services_per_month
                        ? `${remainingServices} de ${activeSubscription.plan.max_services_per_month}`
                        : "Ilimitado"}
                    </span>
                  </div>
                </div>
                <Link href="/plans">
                  <Button variant="outline" className="w-full">
                    Alterar plano
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground">Você ainda não possui um plano ativo.</p>
                <Link href="/plans">
                  <Button variant="default" className="w-full font-medium">
                    Assinar agora
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Uso mensal</CardTitle>
            <CardDescription>Serviços utilizados neste mês</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeSubscription ? (
                <>
                  <div className="h-4 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${activeSubscription.plan.max_services_per_month
                            ? Math.min(
                              100,
                              (appointmentsThisMonth / activeSubscription.plan.max_services_per_month) * 100,
                            )
                            : 0
                          }%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Utilizados</span>
                    <span>{appointmentsThisMonth} serviços</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Restantes</span>
                    <span>{activeSubscription.plan.max_services_per_month ? remainingServices : "Ilimitado"}</span>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">Assine um plano para começar a usar os serviços.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Próximos agendamentos</CardTitle>
            <CardDescription>Seus serviços agendados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAppointments.length > 0 ? (
                recentAppointments.map((appointment) => (
                  <div key={appointment.id} className="border-b pb-3 last:border-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{appointment.service.name}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Scissors className="h-3 w-3 mr-1" />
                          <span>{appointment.salon.name}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-sm">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{new Date(appointment.scheduled_at).toLocaleDateString("pt-BR")}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>
                            {new Date(appointment.scheduled_at).toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">Você não possui agendamentos.</p>
              )}
              {recentAppointments.length > 0 && (
                <Link href="/appointments">
                  <Button variant="outline" className="w-full">
                    Ver todos
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Salões recomendados</CardTitle>
            <CardDescription>Com base na sua localização e preferências</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedSalons.map((salon) => (
                <div key={salon.id} className="border rounded-lg overflow-hidden">
                  <div className="relative h-40 w-full">
                    <Image
                      src={salon.image_url ?? "/placeholder.svg?height=400&width=600"}
                      alt={salon.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium">{salon.name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>{salon.address.substring(0, 30)}...</span>
                    </div>
                    <div className="flex items-center mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="ml-1 text-sm text-muted-foreground">5.0</span>
                    </div>
                    <Link href={`/salons/${salon.id}`}>
                      <Button variant="outline" className="w-full mt-3">
                        Ver detalhes
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Torne-se um parceiro</CardTitle>
          <CardDescription>Cadastre seu salão ou barbearia na plataforma</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="md:w-2/3">
            <p className="text-muted-foreground mb-4">
              Você possui um salão de beleza ou barbearia? Junte-se à nossa plataforma e aumente sua clientela. Receba
              comissões por cada serviço realizado e gerencie seu negócio de forma simples e eficiente.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center">
                <svg className="h-5 w-5 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Aumente sua visibilidade e atraia novos clientes</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Gerencie agendamentos e serviços em um só lugar</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Receba pagamentos diretamente na sua conta</span>
              </li>
            </ul>
          </div>
          <div className="md:w-1/3 flex justify-center">
            <Link href="/register">
              <Button variant="default" size="lg" className="font-medium">
                <UserPlus className="mr-2 h-5 w-5" />
                Cadastrar meu estabelecimento
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}