import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import prismadb from "@/lib/prisma"
import { PartnerRegistrationForm } from "@/components/partner-registration-form"

export default async function PartnerRegisterPage() {
  console.log("🚀 INICIANDO PartnerRegisterPage")

  const { userId } = await auth()
  const clerkUser = await currentUser()

  console.log("🚀 userId:", userId)
  console.log("🚀 clerkUser:", clerkUser?.id)

  if (!userId || !clerkUser) {
    console.log("❌ Usuario não autenticado - redirecionando para sign-in")
    redirect("/sign-in")
  }

  // Verificar se o usuário já existe no banco
  let dbUser = await prismadb.user.findUnique({
    where: {
      clerk_id: userId,
    },
    include: {
      salon: true,
    },
  })

  console.log("🚀 ~ PartnerRegisterPage ~ dbUser:", dbUser)

  // Se o usuário não existe no banco, criar ele
  if (!dbUser) {
    console.log("🔄 Criando usuário no banco...")
    try {
      dbUser = await prismadb.user.create({
        data: {
          clerk_id: userId,
          name: clerkUser.fullName || `${clerkUser.firstName} ${clerkUser.lastName}` || "Usuário",
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          role: "CLIENT",
        },
        include: {
          salon: true,
        },
      })
      console.log("✅ Usuário criado no banco:", dbUser)
    } catch (error) {
      console.error("❌ Erro ao criar usuário:", error)
      redirect("/dashboard")
    }
  }

  // Se já for um parceiro com salão aprovado, redirecionar para o dashboard de parceiro
  if (dbUser.role === "PARTNER" && dbUser.salon && dbUser.salon.status === "APPROVED") {
    console.log("🔄 Usuário é PARTNER aprovado - redirecionando para partner/dashboard")
    redirect("/partner/dashboard")
  }

  // Verificar se já tem um salão pendente
  const hasPendingSalon = dbUser.salon && dbUser.salon.status === "PENDING"
  console.log("🔍 hasPendingSalon:", hasPendingSalon)

  console.log("✅ Renderizando página normalmente")

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Cadastro de Parceiro</h1>

      {hasPendingSalon ? (
        <Card>
          <CardHeader>
            <CardTitle>Solicitação em análise</CardTitle>
            <CardDescription>Seu cadastro como parceiro está sendo analisado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                Obrigado por se cadastrar como parceiro do Beautify Club! Sua solicitação está sendo analisada pela
                nossa equipe.
              </p>
              <p>
                Você receberá uma notificação assim que seu cadastro for aprovado. Enquanto isso, você pode continuar
                utilizando a plataforma como cliente.
              </p>
              <div className="bg-secondary p-4 rounded-lg">
                <h3 className="font-medium mb-2">Informações do estabelecimento</h3>
                <p>
                  <strong>Nome:</strong> {dbUser.salon?.name}
                </p>
                <p>
                  <strong>Endereço:</strong> {dbUser.salon?.address}
                </p>
                <p>
                  <strong>Contato:</strong> {dbUser.salon?.contact_info}
                </p>
                <p>
                  <strong>Data da solicitação:</strong>{" "}
                  {dbUser.salon?.created_at ? new Date(dbUser.salon.created_at).toLocaleDateString("pt-BR") : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Torne-se um parceiro</CardTitle>
              <CardDescription>Cadastre seu salão ou barbearia na plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Junte-se à nossa rede de parceiros e aumente sua visibilidade e clientela. Preencha o formulário abaixo
                com as informações do seu estabelecimento.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-secondary p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Benefícios</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <svg
                        className="h-5 w-5 text-green-600 mr-2 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Aumente sua visibilidade e atraia novos clientes</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="h-5 w-5 text-green-600 mr-2 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Sistema de agendamento online integrado</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="h-5 w-5 text-green-600 mr-2 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Receba pagamentos diretamente na sua conta</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="h-5 w-5 text-green-600 mr-2 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Relatórios e análises de desempenho</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-secondary p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Como funciona</h3>
                  <ol className="space-y-2 list-decimal list-inside">
                    <li>Preencha o formulário com os dados do seu estabelecimento</li>
                    <li>Nossa equipe analisará seu cadastro</li>
                    <li>Após aprovação, você poderá cadastrar seus serviços</li>
                    <li>Comece a receber agendamentos e aumentar sua clientela</li>
                    <li>Receba pagamentos diretamente na sua conta bancária</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          <PartnerRegistrationForm userId={dbUser.id} />
        </>
      )}
    </div>
  )
}
