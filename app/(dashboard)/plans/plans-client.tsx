"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Plan {
  id: string
  name: string
  price: number
  max_services_per_month: number | null
  features: string
  created_at: Date
  updated_at: Date
}

interface ActiveSubscription {
  id: string
  plan_id: string
  end_date: Date
  plan: Plan
}

interface PlansClientProps {
  plans: Plan[]
  activeSubscription?: ActiveSubscription
  isSignedIn: boolean
}

export default function PlansClient({ plans, activeSubscription, isSignedIn }: PlansClientProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleSubscribe = async (planId: string) => {
    if (!isSignedIn) {
      toast({
        title: "Login necessário",
        description: "Você precisa fazer login para assinar um plano.",
      })
      router.push("/sign-in")
      return
    }

    setIsLoading(planId)

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao processar pagamento")
      }

      // Redirecionar para o checkout do Stripe
      window.location.href = data.url
    } catch (error) {
      console.error("Erro ao criar checkout:", error)
      toast({
        title: "Erro ao processar pagamento",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao processar seu pagamento",
        variant: "destructive",
      })
    } finally {
      setIsLoading(null)
    }
  }

  // Determinar qual plano é popular (pode ser baseado em lógica de negócio)
  const getPopularPlan = () => {
    // Por exemplo, o plano do meio ou o mais vendido
    if (plans.length >= 2) {
      return plans[Math.floor(plans.length / 2)].id
    }
    return null
  }

  const popularPlanId = getPopularPlan()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Planos de Assinatura</h1>
        <p className="text-muted-foreground">Escolha o plano ideal para suas necessidades</p>
      </div>

      {activeSubscription && (
        <Card className="bg-secondary">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold">Seu plano atual: {activeSubscription.plan.name}</h2>
                <p className="text-muted-foreground">
                  Próxima cobrança em {new Date(activeSubscription.end_date).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <Button variant="outline">Cancelar assinatura</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {plans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <h3 className="text-lg font-medium">Nenhum plano disponível</h3>
            <p className="text-muted-foreground text-center mt-1">
              No momento não há planos de assinatura disponíveis. Tente novamente mais tarde.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const isActive = activeSubscription?.plan_id === plan.id
            const isPopular = plan.id === popularPlanId
            const features = plan.features.split("\n").filter((feature) => feature.trim() !== "")

            return (
              <Card key={plan.id} className={`overflow-hidden ${isPopular ? "border-accent" : ""}`}>
                <CardHeader className={`pb-8 ${isPopular ? "bg-accent text-white" : "bg-secondary"} relative`}>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  {isPopular && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-white text-accent px-2 py-1 rounded-full text-xs font-medium">
                        Mais Popular
                      </span>
                    </div>
                  )}
                  <div className="mt-4 flex items-baseline">
                    <span className={`text-5xl font-extrabold ${isPopular ? "text-white" : "text-foreground"}`}>
                      R${plan.price.toFixed(2)}
                    </span>
                    <span className={`ml-1 text-xl ${isPopular ? "text-white/80" : "text-muted-foreground"}`}>
                      /mês
                    </span>
                  </div>
                  <div className={`text-sm ${isPopular ? "text-white/80" : "text-muted-foreground"}`}>
                    {plan.max_services_per_month
                      ? `${plan.max_services_per_month} serviços por mês`
                      : "Serviços ilimitados"}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <ul className="space-y-4">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pb-6 px-6">
                  {isActive ? (
                    <Button variant="outline" className="w-full" disabled>
                      Plano atual
                    </Button>
                  ) : (
                    <Button
                      variant={isPopular ? "accent" : "outline"}
                      className={`w-full ${isPopular ? "text-white" : ""}`}
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={isLoading === plan.id}
                    >
                      {isLoading === plan.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : activeSubscription ? (
                        "Mudar para este plano"
                      ) : (
                        "Assinar agora"
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Perguntas frequentes</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="font-bold mb-2">Como funciona a assinatura?</h3>
              <p className="text-muted-foreground">
                Ao assinar um plano, você terá acesso a serviços em todos os salões e barbearias parceiros. O valor é
                cobrado mensalmente e você pode cancelar a qualquer momento.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Quais formas de pagamento são aceitas?</h3>
              <p className="text-muted-foreground">
                Aceitamos cartões de crédito, débito e pagamento via PIX através da plataforma segura do Stripe.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Como funciona o limite de serviços?</h3>
              <p className="text-muted-foreground">
                Cada plano tem um limite mensal de serviços que você pode utilizar. Os planos Premium oferecem serviços
                ilimitados, enquanto outros planos têm limites específicos.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Como cancelar minha assinatura?</h3>
              <p className="text-muted-foreground">
                Você pode cancelar sua assinatura a qualquer momento através da sua conta. O acesso aos serviços
                continuará disponível até o final do período pago.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}