"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres" }),
  description: z.string().min(10, { message: "A descrição deve ter pelo menos 10 caracteres" }),
  base_price: z.number().min(0.01, { message: "O preço deve ser maior que zero" }),
  duration_min: z.number().min(15, { message: "A duração deve ser de pelo menos 15 minutos" }),
  available_days: z.array(z.string()).min(1, { message: "Selecione pelo menos um dia" }),
  available_start_time: z.string(),
  available_end_time: z.string(),
})

type ServiceFormValues = z.infer<typeof formSchema>

const weekDays = [
  { id: "monday", label: "Segunda-feira" },
  { id: "tuesday", label: "Terça-feira" },
  { id: "wednesday", label: "Quarta-feira" },
  { id: "thursday", label: "Quinta-feira" },
  { id: "friday", label: "Sexta-feira" },
  { id: "saturday", label: "Sábado" },
  { id: "sunday", label: "Domingo" },
]

interface ServiceFormProps {
  salonId: string
  serviceId?: string | null
  onSuccess?: () => void
  onCancel?: () => void
}

export function ServiceForm({ salonId, serviceId, onSuccess, onCancel }: ServiceFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const isEditing = !!serviceId

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      base_price: 0,
      duration_min: 60,
      available_days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
      available_start_time: "09:00",
      available_end_time: "18:00",
    },
  })

  // Carregar dados do serviço para edição
  useEffect(() => {
    if (serviceId) {
      const fetchService = async () => {
        setIsLoadingData(true)
        try {
          const response = await fetch(`/api/partner/services/${serviceId}`)
          if (response.ok) {
            const service = await response.json()
            form.reset({
              name: service.name,
              description: service.description,
              base_price: service.base_price,
              duration_min: service.duration_min,
              available_days: service.available_days,
              available_start_time: service.available_start_time,
              available_end_time: service.available_end_time,
            })
          }
        } catch (error) {
          console.error("Erro ao carregar serviço:", error)
          toast({
            title: "Erro ao carregar serviço",
            description: "Não foi possível carregar os dados do serviço",
            variant: "destructive",
          })
        } finally {
          setIsLoadingData(false)
        }
      }
      
      fetchService()
    }
  }, [serviceId, form])

  async function onSubmit(data: ServiceFormValues) {
    setIsLoading(true)
    try {
      const url = isEditing 
        ? `/api/partner/services/${serviceId}` 
        : "/api/partner/services"
      
      const method = isEditing ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          salon_id: salonId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || `Erro ao ${isEditing ? 'atualizar' : 'criar'} serviço`)
      }

      toast({
        title: `Serviço ${isEditing ? 'atualizado' : 'criado'} com sucesso!`,
        description: `O serviço foi ${isEditing ? 'atualizado' : 'adicionado'} ao seu estabelecimento.`,
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error(`Erro ao ${isEditing ? 'atualizar' : 'criar'} serviço:`, error)
      toast({
        title: `Erro ao ${isEditing ? 'atualizar' : 'criar'} serviço`,
        description: error instanceof Error ? error.message : "Ocorreu um erro ao processar sua solicitação",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Carregando dados do serviço...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? 'Editar Serviço' : 'Informações do serviço'}
        </CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do serviço</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Corte de cabelo masculino" {...field} />
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
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o serviço, técnicas utilizadas, o que está incluso..."
                      className="min-h-[100px]"
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
                name="base_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration_min"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duração (minutos)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="60"
                        {...field}
                        onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="available_start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário de início</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="available_end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário de fim</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="available_days"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Dias disponíveis</FormLabel>
                    <FormDescription>Selecione os dias da semana em que este serviço está disponível</FormDescription>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {weekDays.map((day) => (
                      <FormField
                        key={day.id}
                        control={form.control}
                        name="available_days"
                        render={({ field }) => {
                          return (
                            <FormItem key={day.id} className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(day.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, day.id])
                                      : field.onChange(field.value?.filter((value) => value !== day.id))
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">{day.label}</FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex gap-4">
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1"
              >
                Cancelar
              </Button>
            )}
            <Button 
              type="submit" 
              className={onCancel ? "flex-1" : "w-full"} 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Atualizando...' : 'Criando serviço...'}
                </>
              ) : (
                isEditing ? 'Atualizar serviço' : 'Criar serviço'
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}