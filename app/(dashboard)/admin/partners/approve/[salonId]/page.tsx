import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Check, ChevronLeft, MapPin, Phone, User, X } from "lucide-react"

import prismadb from "@/lib/prisma"
import { PartnerApprovalForm } from "@/components/partner-approval-form"

interface PartnerApprovePageProps {
  params: {
    salonId: string
  }
}

export default async function PartnerApprovePage({ params }: PartnerApprovePageProps) {
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

  // Buscar o salão pelo ID
  const salon = await prismadb.salon.findUnique({
    where: {
      id: params.salonId,
    },
    include: {
      user: true,
    },
  })

  if (!salon) {
    redirect("/admin/partners")
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link href="/admin/partners" className="flex items-center text-muted-foreground hover:text-foreground mb-2">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar para lista de parceiros
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Aprovar Parceiro</h1>
          <p className="text-muted-foreground">Revise e aprove a solicitação de parceria</p>
        </div>
        <div className="flex gap-4">
          <PartnerApprovalForm salonId={salon.id} initialStatus={salon.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações do estabelecimento</CardTitle>
              <CardDescription>Detalhes do salão ou barbearia</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Nome do estabelecimento</h3>
                  <p className="text-lg font-medium">{salon.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Status atual</h3>
                  <div className="flex items-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        salon.status === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : salon.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {salon.status === "APPROVED" ? "Aprovado" : salon.status === "PENDING" ? "Pendente" : "Rejeitado"}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Endereço</h3>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p>{salon.address}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Contato</h3>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p>{salon.contact_info}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Descrição</h3>
                <p className="text-foreground whitespace-pre-line">{salon.description}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Informações de pagamento</h3>
                <div className="bg-secondary p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Tipo de chave PIX</p>
                      <p className="font-medium">{salon.pix_key_type || "Não informado"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Chave PIX</p>
                      <p className="font-medium">{salon.pix_key || "Não informada"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Localização</h3>
                <div className="bg-secondary h-64 rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Latitude: {salon.latitude}, Longitude: {salon.longitude}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Proprietário</CardTitle>
              <CardDescription>Informações do solicitante</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="ml-4">
                  <p className="font-medium">{salon.user.name}</p>
                  <p className="text-sm text-muted-foreground">{salon.user.email}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">ID do usuário</h3>
                <p className="text-sm">{salon.user.id}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Data da solicitação</h3>
                <p>
                  {new Date(salon.created_at).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
              <CardDescription>Aprovar ou rejeitar a solicitação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Observações (opcional)</label>
                <Textarea
                  placeholder="Adicione observações ou motivo da aprovação/rejeição"
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button variant="default" className="w-full" disabled={salon.status === "APPROVED"}>
                <Check className="h-4 w-4 mr-2" />
                {salon.status === "APPROVED" ? "Já aprovado" : "Aprovar parceiro"}
              </Button>
              <Button variant="destructive" className="w-full" disabled={salon.status === "REJECTED"}>
                <X className="h-4 w-4 mr-2" />
                {salon.status === "REJECTED" ? "Já rejeitado" : "Rejeitar parceiro"}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Checklist de aprovação</CardTitle>
              <CardDescription>Itens a verificar antes de aprovar</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <input type="checkbox" className="mt-1 mr-2" />
                  <span>Informações do estabelecimento estão completas</span>
                </li>
                <li className="flex items-start">
                  <input type="checkbox" className="mt-1 mr-2" />
                  <span>Endereço é válido e verificável</span>
                </li>
                <li className="flex items-start">
                  <input type="checkbox" className="mt-1 mr-2" />
                  <span>Informações de contato são válidas</span>
                </li>
                <li className="flex items-start">
                  <input type="checkbox" className="mt-1 mr-2" />
                  <span>Informações de pagamento estão corretas</span>
                </li>
                <li className="flex items-start">
                  <input type="checkbox" className="mt-1 mr-2" />
                  <span>Descrição do estabelecimento é adequada</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
