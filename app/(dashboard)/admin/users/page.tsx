import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, UserCog } from "lucide-react"

import prismadb from "@/lib/prisma"
import { UserRoleManager } from "@/components/user-role-manager"

export default async function AdminUsersPage() {
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

  // Buscar todos os usuários
  const users = await prismadb.user.findMany({
    orderBy: {
      created_at: "desc",
    },
    include: {
      salon: true,
      subscriptions: {
        where: {
          status: "ACTIVE",
        },
        include: {
          plan: true,
        },
        take: 1,
      },
    },
  })

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gerenciar Usuários</h1>
          <p className="text-muted-foreground">Administre os usuários da plataforma</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input placeholder="Buscar usuários" className="pl-10" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuários da plataforma</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6 last:border-0 last:pb-0"
              >
                <div>
                  <h3 className="font-medium text-lg">{user.name}</h3>
                  <p className="text-muted-foreground">{user.email}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        user.role === "ADMIN"
                          ? "bg-purple-100 text-purple-800"
                          : user.role === "PARTNER"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.role === "ADMIN" ? "Administrador" : user.role === "PARTNER" ? "Parceiro" : "Cliente"}
                    </span>
                    {user.salon && (
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          user.salon.status === "APPROVED"
                            ? "bg-green-100 text-green-800"
                            : user.salon.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        Salão:{" "}
                        {user.salon.status === "APPROVED"
                          ? "Aprovado"
                          : user.salon.status === "PENDING"
                            ? "Pendente"
                            : "Rejeitado"}
                      </span>
                    )}
                    {user.subscriptions.length > 0 && (
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        Plano: {user.subscriptions[0].plan.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <UserRoleManager userId={user.id} currentRole={user.role} />
                  <Button variant="outline" size="sm">
                    <UserCog className="h-4 w-4 mr-2" />
                    Detalhes
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
