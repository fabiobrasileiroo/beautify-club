"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { LocationPicker } from "@/components/location-picker"

const formSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres" }),
  address: z.string().min(5, { message: "Endereço muito curto" }),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  contact_info: z.string().min(8, { message: "Informações de contato muito curtas" }),
  description: z.string().min(20, { message: "A descrição deve ter pelo menos 20 caracteres" }),
  pix_key: z.string().min(5, { message: "Chave PIX inválida" }),
  pix_key_type: z.enum(["CPF", "CNPJ", "EMAIL", "TELEFONE", "ALEATORIA"]),
})

type PartnerFormValues = z.infer<typeof formSchema>

interface PartnerRegistrationFormProps {
  userId: string
}

export function PartnerRegistrationForm({ userId }: PartnerRegistrationFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      contact_info: "",
      description: "",
      pix_key: "",
      pix_key_type: "CPF",
    },
  })

  const handleLocationSelected = (latitude: number, longitude: number, source: string) => {
    form.setValue("latitude", latitude)
    form.setValue("longitude", longitude)

    toast({
      title: "Localização definida",
      description: `Coordenadas obtidas via ${source === "gps" ? "GPS" : source === "ip" ? "IP" : "endereço"}`,
    })
  }

  async function onSubmit(data: PartnerFormValues) {
    setIsLoading(true)

    try {
      const response = await fetch("/api/partner/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          name: data.name,
          address: data.address,
          latitude: data.latitude || null,
          longitude: data.longitude || null,
          contact_info: data.contact_info,
          description: data.description,
          pix_key: data.pix_key,
          pix_key_type: data.pix_key_type,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Erro ao cadastrar parceiro")
      }

      toast({
        title: "Cadastro enviado com sucesso!",
        description:
          "Sua solicitação foi enviada e está em análise. Você receberá uma notificação quando for aprovada.",
      })

      // Redirecionar para a página de confirmação ou recarregar a página atual
      router.refresh()
    } catch (error) {
      console.error("Erro ao cadastrar parceiro:", error)
      toast({
        title: "Erro ao cadastrar",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao processar sua solicitação",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações do estabelecimento</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do estabelecimento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Barbearia Estilo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Rua Exemplo, 123 - Bairro, Cidade - UF" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-muted/50 p-4 rounded-md">
              <h3 className="text-sm font-medium mb-2">Localização</h3>
              <LocationPicker onLocationSelected={handleLocationSelected} />
            </div>

            <FormField
              control={form.control}
              name="contact_info"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone de contato</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: (11) 99999-9999" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição do estabelecimento</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva seu estabelecimento, especialidades, horário de funcionamento, etc."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="pix_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chave PIX para recebimentos</FormLabel>
                    <FormControl>
                      <Input placeholder="Informe sua chave PIX" {...field} />
                    </FormControl>
                    <FormDescription>Esta chave será usada para transferir os valores das comissões</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pix_key_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de chave PIX</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value="CPF">CPF</option>
                        <option value="CNPJ">CNPJ</option>
                        <option value="EMAIL">E-mail</option>
                        <option value="TELEFONE">Telefone</option>
                        <option value="ALEATORIA">Chave aleatória</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar cadastro"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
