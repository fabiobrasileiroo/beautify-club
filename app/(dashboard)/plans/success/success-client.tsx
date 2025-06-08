"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface Plan {
  id: string
  name: string
  price: number
  max_services_per_month: number | null
  features: string
  created_at: Date
  updated_at: Date
}

interface Subscription {
  id: string
  plan_id: string
  end_date: Date
  plan: Plan
}

interface SuccessClientProps {
  subscription: Subscription
}

export default function SuccessClient({ subscription }: SuccessClientProps) {
  const router = useRouter()

  const handleNavigate = (path: string) => {
    router.push(path)
  }

  return (
    <div className="flex flex-col items-center justify-center py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Assinatura Confirmada!</CardTitle>
          <CardDescription>Seu plano {subscription.plan.name} foi ativado com sucesso.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg bg-muted p-4">
            <div className="mb-2 text-sm font-medium">Detalhes da assinatura:</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Plano:</div>
              <div className="font-medium">{subscription.plan.name}</div>
              <div className="text-muted-foreground">Valor:</div>
              <div className="font-medium">R$ {subscription.plan.price.toFixed(2)}/mês</div>
              <div className="text-muted-foreground">Próxima cobrança:</div>
              <div className="font-medium">{new Date(subscription.end_date).toLocaleDateString("pt-BR")}</div>
            </div>
          </div>
          <div className="space-y-2">
            <Button className="w-full" onClick={() => handleNavigate("/dashboard")}>
              Ir para o Dashboard
            </Button>
            <Button variant="outline" className="w-full" onClick={() => handleNavigate("/salons")}>
              Explorar salões
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}