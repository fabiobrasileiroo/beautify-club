import Link from "next/link"
import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Settings, Key, Bell } from "lucide-react"

import prismadb from "@/lib/prisma"

export default async function ProfilePage() {
  const { userId } = await auth()
  const clerkUser = await currentUser()

  if (!userId || !clerkUser) {
    redirect("/sign-in")
  }

  // Buscar usuário do banco de dados
  const dbUser = await prismadb.user.findUnique({
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
    },
  })

  if (!dbUser) {
    redirect("/dashboard")
  }

  const activeSubscription = dbUser.subscriptions[0]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informações pessoais e preferências</p>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList>
          <TabsTrigger value="account">
            <User className="h-4 w-4 mr-2" />
            Conta
          </TabsTrigger>
          <TabsTrigger value="subscription">
            <Key className="h-4 w-4 mr-2" />
            Assinatura
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Settings className="h-4 w-4 mr-2" />
            Preferências
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notificações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações pessoais</CardTitle>
              <CardDescription>Atualize suas informações de perfil</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input id="name" defaultValue={dbUser.name} disabled />
                  <p className="text-xs text-muted-foreground">Para alterar seu nome, atualize seu perfil no Clerk.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={dbUser.email} disabled />
                  <p className="text-xs text-muted-foreground">Para alterar seu email, atualize seu perfil no Clerk.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" placeholder="(00) 00000-0000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input id="address" placeholder="Rua, número, bairro" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button>Salvar alterações</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>Gerencie suas opções de segurança</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Senha</Label>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Sua senha é gerenciada pelo Clerk. Clique no botão para alterá-la.
                  </p>
                  <Button variant="outline">Alterar senha</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Autenticação de dois fatores</Label>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança à sua conta.</p>
                  <Button variant="outline">Configurar 2FA</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes da assinatura</CardTitle>
              <CardDescription>Informações sobre seu plano atual</CardDescription>
            </CardHeader>
            <CardContent>
              {activeSubscription ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-2">Plano atual</h3>
                      <div className="bg-secondary p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-lg">{activeSubscription.plan.name}</span>
                          <span className="text-primary font-bold">R${activeSubscription.plan.price}/mês</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Próxima cobrança em {new Date(activeSubscription.end_date).toLocaleDateString("pt-BR")}
                        </p>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Serviços incluídos: </span>
                          <span>
                            {activeSubscription.plan.max_services_per_month
                              ? `${activeSubscription.plan.max_services_per_month} por mês`
                              : "Ilimitados"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Método de pagamento</h3>
                      <div className="bg-secondary p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <div className="h-8 w-12 bg-foreground/10 rounded mr-3 flex items-center justify-center">
                            <span className="text-xs font-medium">VISA</span>
                          </div>
                          <div>
                            <p className="font-medium">Cartão terminando em 1234</p>
                            <p className="text-xs text-muted-foreground">Expira em 12/2025</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                          Atualizar método de pagamento
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-4 justify-end">
                    <Button variant="outline">Histórico de pagamentos</Button>
                    <Button variant="outline" className="text-destructive">
                      Cancelar assinatura
                    </Button>
                    <Link href="/plans">
                      <Button>Alterar plano</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <h3 className="text-xl font-medium mb-2">Você não possui uma assinatura ativa</h3>
                  <p className="text-muted-foreground mb-6">
                    Assine um plano para aproveitar todos os benefícios do Beautify Club.
                  </p>
                  <Link href="/plans">
                    <Button>Ver planos disponíveis</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferências</CardTitle>
              <CardDescription>Personalize sua experiência</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Tema</Label>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Escolha entre tema claro, escuro ou siga as configurações do sistema.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Claro
                    </Button>
                    <Button variant="outline" size="sm">
                      Escuro
                    </Button>
                    <Button variant="outline" size="sm">
                      Sistema
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Idioma</Label>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Selecione o idioma da plataforma.</p>
                  <select className="border rounded-md p-2">
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es">Español</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>Configure suas preferências de notificação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Lembretes de agendamento</h3>
                    <p className="text-sm text-muted-foreground">Receba lembretes sobre seus próximos agendamentos.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Email
                    </Button>
                    <Button variant="outline" size="sm">
                      SMS
                    </Button>
                    <Button variant="outline" size="sm">
                      Push
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Promoções e novidades</h3>
                    <p className="text-sm text-muted-foreground">Receba informações sobre promoções e novidades.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Email
                    </Button>
                    <Button variant="outline" size="sm">
                      SMS
                    </Button>
                    <Button variant="outline" size="sm">
                      Push
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Atualizações da conta</h3>
                    <p className="text-sm text-muted-foreground">Receba notificações sobre alterações na sua conta.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Email
                    </Button>
                    <Button variant="outline" size="sm">
                      SMS
                    </Button>
                    <Button variant="outline" size="sm">
                      Push
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button>Salvar preferências</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
