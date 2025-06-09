// hooks/use-subscription.ts
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

interface UseSubscriptionReturn {
  cancelSubscription: (subscriptionId: string) => Promise<void>
  isCanceling: boolean
  reactivateSubscription: (planId: string) => Promise<void>
  isReactivating: boolean
}

export function useSubscription(): UseSubscriptionReturn {
  const router = useRouter()
  const [isCanceling, setIsCanceling] = useState(false)
  const [isReactivating, setIsReactivating] = useState(false)

  const cancelSubscription = async (subscriptionId: string) => {
    setIsCanceling(true)

    try {
      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subscriptionId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao cancelar assinatura")
      }

      toast({
        title: "Assinatura cancelada",
        description: "Sua assinatura foi cancelada com sucesso. Você continuará tendo acesso aos serviços até o final do período pago.",
      })

      // Recarregar a página para atualizar os dados
      router.refresh()

    } catch (error) {
      console.error("Erro ao cancelar assinatura:", error)
      toast({
        title: "Erro ao cancelar assinatura",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao cancelar sua assinatura",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsCanceling(false)
    }
  }

  const reactivateSubscription = async (planId: string) => {
    setIsReactivating(true)

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
        throw new Error(data.error || "Erro ao reativar assinatura")
      }

      // Redirecionar para o checkout do Stripe
      window.location.href = data.url

    } catch (error) {
      console.error("Erro ao reativar assinatura:", error)
      toast({
        title: "Erro ao reativar assinatura",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao reativar sua assinatura",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsReactivating(false)
    }
  }

  return {
    cancelSubscription,
    isCanceling,
    reactivateSubscription,
    isReactivating,
  }
}