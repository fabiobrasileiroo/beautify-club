import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Scissors } from "lucide-react"
import Link from "next/link"

import prismadb from "@/lib/prisma"
import { syncClerkUser } from "@/lib/clerk"

export default async function DashboardPage() {
  const { userId } = await auth()
  const clerkUser = await currentUser()

  if (!userId || !clerkUser) {
    redirect("/sign-in")
  }

  try {
    // Sincronizar usuário do Clerk com o banco de dados
    await syncClerkUser(clerkUser)
  } catch (error) {
    console.error("Falha ao sincronizar usuário:", error)
    // Não redirecionamos para não interromper a experiência do usuário
  }

  // Buscar usuário do banco de dados
  let dbUser = await prismadb.user.findUnique({
    where: {
      clerk_id: userId,
    },
    include: {
      subscriptions: {
        include: {
          plan: true,
        },
        where: {
          status: "ACTIVE",
        },
        orderBy: {
          created_at: "desc",
        },
        take: 1,
      },
      appointments: {
        include: {
          salon: true,
          service: true,
        },
        orderBy: {
          scheduled_at: "desc",
        },
        take: 3,
      },
    },
  })

  // Se não existir, criar o usuário (isso não deveria acontecer se a sincronização funcionou)
  if (!dbUser) {
    console.warn("Usuário não encontrado após sincronização, criando manualmente")
    try {
      dbUser = await prismadb.user.create({
        data: {
          clerk_id: userId,
          name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "Usuário",
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          role: "CLIENT",
        },
        include: {
          subscriptions: {
            include: {
              plan: true,
            },
            where: {
              status: "ACTIVE",
            },
            orderBy: {
              created_at: "desc",
            },
            take: 1,
          },
          appointments: {
            include: {
              salon: true,
              service: true,
            },
            orderBy: {
              scheduled_at: "desc",
            },
            take: 3,
          },
        },
      })

      // Atualizar os metadados do usuário no Clerk
      await clerkUser.update({
        publicMetadata: {
          role: "CLIENT",
          userId: dbUser.id,
        },
      })

      console.log("Usuário criado manualmente com sucesso:", dbUser.id)
    } catch (error) {
      console.error("Erro ao criar usuário manualmente:", error)
      // Tentar novamente a busca, caso o usuário tenha sido criado por outro processo
      dbUser = await prismadb.user.findUnique({
        where: {
          clerk_id: userId,
        },
        include: {
          subscriptions: {
            include: {
              plan: true,
            },
            where: {
              status: "ACTIVE",
            },
            orderBy: {
              created_at: "desc",
            },
            take: 1,
          },
          appointments: {
            include: {
              salon: true,
              service: true,
            },
            orderBy: {
              scheduled_at: "desc",
            },
            take: 3,
          },
        },
      })

      if (!dbUser) {
        redirect("/error?message=Falha+ao+criar+usuário")
      }
    }
  }

  const activeSubscription = dbUser.subscriptions[0]
  const recentAppointments = dbUser.appointments

  // Calcular serviços restantes no mês
  const currentDate = new Date()
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

  const appointmentsThisMonth = await prismadb.appointment.count({
    where: {
      user_id: dbUser.id,
      scheduled_at: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
      status: {
        in: ["SCHEDULED", "COMPLETED"],
      },
    },
  })

  const maxServicesPerMonth = activeSubscription?.plan.max_services_per_month || 0
  const remainingServices = maxServicesPerMonth - appointmentsThisMonth

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Bem-vindo(a), {dbUser.name}</p>
        </div>
        <div className="flex gap-4">
          <Link href="/salons">
            <Button variant="accent" className="text-white">
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
                  <span className="text-accent font-bold">R${activeSubscription.plan.price}/mês</span>
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
                  <Button variant="accent" className="w-full text-white">
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
                      className="h-full bg-accent"
                      style={{
                        width: `${
                          activeSubscription.plan.max_services_per_month
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
              {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-lg overflow-hidden">
                  <div className="h-40 bg-secondary" />
                  <div className="p-4">
                    <h3 className="font-medium">Salão Exemplo {i}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>2.5 km de distância</span>
                    </div>
                    <div className="flex items-center mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="ml-1 text-sm text-muted-foreground">5.0</span>
                    </div>
                    <Link href={`/salons/${i}`}>
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
    </div>
  )
}
