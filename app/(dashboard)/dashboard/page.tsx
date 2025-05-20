import { auth, clerkClient, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"

import prismadb from "@/lib/prisma"
import { DashboardClient } from "@/components/dashboard-client"

export default async function DashboardPage() {
  const clerk = await clerkClient();
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  try {
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

    // Se não existir, criar o usuário
    if (!dbUser) {
      // Verificar se é o primeiro usuário no sistema
      const userCount = await prismadb.user.count()
      const isFirstUser = userCount === 0
      const userRole = isFirstUser ? "ADMIN" : "CLIENT"

      // Obter informações do usuário do Clerk
      const clerkUserInfo = await currentUser()

      if (!clerkUserInfo) {
        throw new Error("Não foi possível obter informações do usuário")
      }

      dbUser = await prismadb.user.create({
        data: {
          clerk_id: userId,
          name: `${clerkUserInfo.firstName || ""} ${clerkUserInfo.lastName || ""}`.trim() || "Usuário",
          email: clerkUserInfo.emailAddresses[0]?.emailAddress || "",
          role: userRole as "ADMIN" | "PARTNER" | "CLIENT",
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
      // Corrigindo o método de atualização
      await clerk.users.updateUser(userId, {
        publicMetadata: {
          role: userRole,
          userId: dbUser.id,
        },
      })

      console.log(`Usuário criado com sucesso: ${dbUser.id}, Role: ${userRole}`)
    }

    // Verificar se o usuário é admin ou partner e redirecionar para o dashboard apropriado
    if (dbUser?.role === "ADMIN") {
      redirect("/admin/dashboard")
    } else if (dbUser?.role === "PARTNER") {
      redirect("/partner/dashboard")
    }

    // Calcular serviços restantes no mês
    const currentDate = new Date()
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

    const appointmentsThisMonth = await prismadb.appointment.count({
      where: {
        user_id: dbUser?.id || "",
        scheduled_at: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        status: {
          in: ["SCHEDULED", "COMPLETED"],
        },
      },
    })

    const activeSubscription = dbUser?.subscriptions[0]
    const maxServicesPerMonth = activeSubscription?.plan.max_services_per_month || 0
    const remainingServices = maxServicesPerMonth - appointmentsThisMonth

    // Buscar salões recomendados
    const recommendedSalons = await prismadb.salon.findMany({
      where: {
        status: "APPROVED",
      },
      include: {
        services: true,
      },
      take: 3,
    })

    return (
      <DashboardClient
        user={dbUser}
        activeSubscription={activeSubscription}
        recentAppointments={dbUser?.appointments || []}
        remainingServices={remainingServices}
        appointmentsThisMonth={appointmentsThisMonth}
        recommendedSalons={recommendedSalons}
      />
    )
  } catch (error) {
    console.error("Erro ao carregar dashboard:", error)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold mb-4">Erro ao carregar dashboard</h1>
        <p className="text-muted-foreground mb-6">Ocorreu um erro ao carregar suas informações.</p>
        <Button asChild>
          <a href="/dashboard">Tentar novamente</a>
        </Button>
      </div>
    )
  }
}
