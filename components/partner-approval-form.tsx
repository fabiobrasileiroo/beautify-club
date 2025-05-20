"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Check, Loader2, X } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface PartnerApprovalFormProps {
  salonId: string
  initialStatus: string
}

export function PartnerApprovalForm({ salonId, initialStatus }: PartnerApprovalFormProps) {
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const router = useRouter()

  const handleApprove = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/partner/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          salonId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Erro ao aprovar parceiro")
      }

      toast({
        title: "Parceiro aprovado com sucesso",
        description: "O estabelecimento foi aprovado e o usuário foi notificado.",
      })

      router.refresh()
      setIsApproveDialogOpen(false)
    } catch (error) {
      console.error("Erro ao aprovar parceiro:", error)
      toast({
        title: "Erro ao aprovar parceiro",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao processar sua solicitação",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Motivo da rejeição obrigatório",
        description: "Por favor, informe o motivo da rejeição para continuar.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/partner/reject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          salonId,
          reason: rejectionReason,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Erro ao rejeitar parceiro")
      }

      toast({
        title: "Parceiro rejeitado",
        description: "A solicitação de parceria foi rejeitada e o usuário foi notificado.",
      })

      router.refresh()
      setIsRejectDialogOpen(false)
    } catch (error) {
      console.error("Erro ao rejeitar parceiro:", error)
      toast({
        title: "Erro ao rejeitar parceiro",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao processar sua solicitação",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="default"
        onClick={() => setIsApproveDialogOpen(true)}
        disabled={initialStatus === "APPROVED" || initialStatus === "REJECTED"}
      >
        <Check className="h-4 w-4 mr-2" />
        Aprovar
      </Button>
      <Button
        variant="destructive"
        onClick={() => setIsRejectDialogOpen(true)}
        disabled={initialStatus === "APPROVED" || initialStatus === "REJECTED"}
      >
        <X className="h-4 w-4 mr-2" />
        Rejeitar
      </Button>

      {/* Dialog de Aprovação */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprovar parceiro</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja aprovar este parceiro? O estabelecimento ficará visível para todos os usuários e o
              proprietário poderá começar a cadastrar serviços.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button onClick={handleApprove} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Aprovando...
                </>
              ) : (
                "Confirmar aprovação"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Rejeição */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar parceiro</DialogTitle>
            <DialogDescription>
              Por favor, informe o motivo da rejeição. Esta informação será enviada ao solicitante.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Motivo da rejeição"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejeitando...
                </>
              ) : (
                "Confirmar rejeição"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
