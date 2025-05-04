import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Edit, Plus, Trash } from "lucide-react"

import prismadb from "@/lib/prisma"

export default async function PartnerServicesPage() {
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

  // Buscar serviços do salão
  const services = await prismadb.service.findMany({
    where: {
      salon_id: dbUser.salon.id,
    },
    orderBy: {
      name: "asc",
    },
  })

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gerenciar Serviços</h1>
          <p className="text-muted-foreground">Adicione e edite os serviços oferecidos pelo seu salão</p>
        </div>
        <Link href="/partner/services/new">
          <Button variant="accent" className="text-white">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar serviço
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seus serviços</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.length > 0 ? (
              services.map((service) => (
                <div
                  key={service.id}
                  className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <h3 className="font-medium text-lg">{service.name}</h3>
                    <p className="text-muted-foreground">{service.description}</p>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{service.duration_min} minutos</span>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row items-end md:items-center gap-4">
                    <span className="text-lg font-bold">R${service.base_price.toFixed(2)}</span>
                    <div className="flex gap-2">
                      <Link href={`/partner/services/${service.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                      </Link>
                      <Button variant="destructive" size="sm">
                        <Trash className="h-4 w-4 mr-2" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-2">Nenhum serviço cadastrado</h3>
                <p className="text-muted-foreground mb-6">Adicione serviços para que os clientes possam agendar.</p>
                <Link href="/partner/services/new">
                  <Button variant="accent" className="text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar serviço
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dicas para configurar seus serviços</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold mb-2">Seja específico nos nomes</h3>
              <p className="text-muted-foreground">
                Use nomes claros e específicos para seus serviços, como "Corte de cabelo masculino" ou "Manicure com
                esmaltação em gel".
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Defina a duração corretamente</h3>
              <p className="text-muted-foreground">
                Calcule o tempo médio que cada serviço leva para ser realizado, incluindo preparação e finalização.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Preços competitivos</h3>
              <p className="text-muted-foreground">
                Pesquise os preços praticados na sua região para manter seus serviços competitivos e atrativos para os
                clientes.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Descrições detalhadas</h3>
              <p className="text-muted-foreground">
                Inclua informações importantes nas descrições, como o que está incluso no serviço, técnicas utilizadas e
                resultados esperados.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
