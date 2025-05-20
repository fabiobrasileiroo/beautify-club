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
  DialogTrigger,
} from "@/components/ui/dialog"
import { UserCog, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface UserRoleManagerProps {
  userId: string
  currentRole: string
}

export function UserRoleManager({ userId, currentRole }: UserRoleManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState(currentRole)
  const router = useRouter()

  const handleRoleChange = async () => {
    if (selectedRole === currentRole) {
      setIsOpen(false)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/update-user-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          role: selectedRole,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Erro ao atualizar papel do usuário")
      }

      toast({
        title: "Papel atualizado com sucesso",
        description: `O usuário agora é um ${
          selectedRole === "ADMIN" ? "Administrador" : selectedRole === "PARTNER" ? "Parceiro" : "Cliente"
        }`,
      })

      router.refresh()
    } catch (error) {
      console.error("Erro ao atualizar papel do usuário:", error)
      toast({
        title: "Erro ao atualizar papel",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao processar sua solicitação",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsOpen(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserCog className="h-4 w-4 mr-2" />
          Alterar papel
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alterar papel do usuário</DialogTitle>
          <DialogDescription>
            Selecione o novo papel para este usuário. Isso afetará suas permissões na plataforma.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Papel atual: </label>
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                currentRole === "ADMIN"
                  ? "bg-purple-100 text-purple-800"
                  : currentRole === "PARTNER"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-green-100 text-green-800"
              }`}
            >
              {currentRole === "ADMIN" ? "Administrador" : currentRole === "PARTNER" ? "Parceiro" : "Cliente"}
            </span>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Novo papel:</label>
            <div className="flex flex-col space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="role"
                  value="CLIENT"
                  checked={selectedRole === "CLIENT"}
                  onChange={() => setSelectedRole("CLIENT")}
                  className="h-4 w-4 text-accent"
                />
                <span>Cliente</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="role"
                  value="PARTNER"
                  checked={selectedRole === "PARTNER"}
                  onChange={() => setSelectedRole("PARTNER")}
                  className="h-4 w-4 text-accent"
                />
                <span>Parceiro</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="role"
                  value="ADMIN"
                  checked={selectedRole === "ADMIN"}
                  onChange={() => setSelectedRole("ADMIN")}
                  className="h-4 w-4 text-accent"
                />
                <span>Administrador</span>
              </label>
            </div>
          </div>
          <div className="bg-secondary p-3 rounded-md text-sm">
            <p className="font-medium mb-1">Atenção:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Alterar para Cliente: Remove acesso administrativo ou de parceiro</li>
              <li>Alterar para Parceiro: Permite gerenciar um estabelecimento</li>
              <li>Alterar para Administrador: Concede acesso total à plataforma</li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleRoleChange} disabled={isLoading || selectedRole === currentRole}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Atualizando...
              </>
            ) : (
              "Confirmar alteração"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
