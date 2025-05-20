import Link from "next/link"
import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

import prismadb from "@/lib/prisma"

export default async function PartnerRegisterConfirmationPage() {
  const { userId } = await auth()
  const clerkUser = await currentUser()

  if (!userId || !clerkUser) {
    redirect("/sign-in")
  }

  // Verificar se o usuário já é um parceiro
  const dbUser = await prismadb.user.findUnique({
    where: {
      clerk_id: userId,
    },
    include: {
      salon: true,
    },
  })

  if (!dbUser) {
    redirect("/dashboard")
  }

  // Se não tiver um salão pendente, redirecionar para a página de registro
  if (!dbUser.salon || dbUser.salon.status !== "PENDING") {
    redirect("/partner/register")
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-green-200">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Solicitação enviada com sucesso!</CardTitle>
          <CardDescription className="text-lg">
            Sua solicitação para se tornar um parceiro foi recebida e está em análise.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-secondary p-6 rounded-lg">
            <h3 className="font-medium text-lg mb-4">Próximos passos:</h3>
            <ol className="space-y-4 list-decimal list-inside">
              <li className="text-foreground">
                <span className="font-medium">Análise da solicitação:</span> Nossa equipe está analisando suas
                informações e verificando os dados do seu estabelecimento.
              </li>
              <li className="text-foreground">
                <span className="font-medium">Aprovação:</span> Após a aprovação, você receberá uma notificação por
                e-mail e poderá começar a cadastrar seus serviços.
              </li>
              <li className="text-foreground">
                <span className="font-medium">Configuração do perfil:</span> Complete o perfil do seu estabelecimento
                adicionando fotos, horários de funcionamento e serviços oferecidos.
              </li>
              <li className="text-foreground">
                <span className="font-medium">Comece a receber clientes:</span> Seu estabelecimento estará visível para
                todos os usuários da plataforma.
              </li>
            </ol>
          </div>

          <div className="bg-secondary p-6 rounded-lg">
            <h3 className="font-medium text-lg mb-4">Informações do estabelecimento:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium">{dbUser.salon.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Endereço</p>
                <p className="font-medium">{dbUser.salon.address}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contato</p>
                <p className="font-medium">{dbUser.salon.contact_info}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium">
                  <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Em análise</span>
                </p>
              </div>
            </div>
          </div>

          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              O tempo médio de análise é de 1 a 3 dias úteis. Você receberá uma notificação assim que sua solicitação
              for aprovada.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button variant="outline">Voltar para o Dashboard</Button>
              </Link>
              <Link href="/partner/register">
                <Button variant="default">Ver detalhes da solicitação</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
