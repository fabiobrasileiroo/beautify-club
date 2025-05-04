import Link from "next/link"
import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, MapPin, Phone, X } from "lucide-react"

import prismadb from "@/lib/prisma"

export default async function AdminPartnersPage() {
  const { userId } = auth()
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

  // Buscar parceiros
  const pendingPartners = await prismadb.salon.findMany({
    where: {
      status: "PENDING",
    },
    include: {
      user: true,
    },
    orderBy: {
      created_at: "desc",
    },
  })

  const approvedPartners = await prismadb.salon.findMany({
    where: {
      status: "APPROVED",
    },
    include: {
      user: true,
      services: true,
    },
    orderBy: {
      name: "asc",
    },
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gerenciar Parceiros</h1>
        <p className="text-muted-foreground">Aprove e gerencie salões e barbearias parceiros</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Parceiros pendentes ({pendingPartners.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {pendingPartners.length > 0 ? (
              pendingPartners.map((salon) => (
                <div
                  key={salon.id}
                  className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6 last:border-0 last:pb-0"
                >
                  <div>
                    <h3 className="font-medium text-lg">{salon.name}</h3>
                    <div className="flex items-center text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{salon.address}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground mt-1">
                      <Phone className="h-4 w-4 mr-1" />
                      <span>{salon.contact_info}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Proprietário: {salon.user.name} ({salon.user.email})
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Solicitado em: {new Date(salon.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Ver detalhes
                    </Button>
                    <Button variant="accent" size="sm" className="text-white">
                      <Check className="h-4 w-4 mr-2" />
                      Aprovar
                    </Button>
                    <Button variant="destructive" size="sm">
                      <X className="h-4 w-4 mr-2" />
                      Rejeitar
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">Não há parceiros pendentes de aprovação.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Parceiros aprovados ({approvedPartners.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {approvedPartners.length > 0 ? (
              approvedPartners.map((salon) => (
                <div
                  key={salon.id}
                  className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6 last:border-0 last:pb-0"
                >
                  <div>
                    <h3 className="font-medium text-lg">{salon.name}</h3>
                    <div className="flex items-center text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{salon.address}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground mt-1">
                      <Phone className="h-4 w-4 mr-1" />
                      <span>{salon.contact_info}</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-sm text-muted-foreground">
                        {salon.services.length} serviços cadastrados
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/admin/partners/${salon.id}`}>
                      <Button variant="outline" size="sm">
                        Ver detalhes
                      </Button>
                    </Link>
                    <Button variant="destructive" size="sm">
                      Suspender
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">Não há parceiros aprovados.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
