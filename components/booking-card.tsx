"use client"

import { useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, User } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface BookingCardProps {
  salon: {
    id: string
    name: string
    services: Array<{
      id: string
      name: string
      base_price: number
      duration_min: number
      available_days?: string | null
      available_start_time?: string
      available_end_time?: string
    }>
  }
}

export function BookingCard({ salon }: BookingCardProps) {
  const { isSignedIn, userId } = useAuth()
  const router = useRouter()
  const [selectedService, setSelectedService] = useState(salon.services[0]?.id || "")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const generateTimeSlots = () => {
    const service = salon.services.find((s) => s.id === selectedService)
    if (!service) return []

    const startTime = service.available_start_time || "09:00"
    const endTime = service.available_end_time || "18:00"
    const duration = service.duration_min || 60

    const slots = []
    const start = new Date(`2000-01-01T${startTime}:00`)
    const end = new Date(`2000-01-01T${endTime}:00`)

    while (start < end) {
      slots.push(start.toTimeString().slice(0, 5))
      start.setMinutes(start.getMinutes() + duration)
    }

    return slots
  }

  const isDateAvailable = (date: string) => {
    const service = salon.services.find((s) => s.id === selectedService)
    if (!service?.available_days) return true

    try {
      const availableDays = JSON.parse(service.available_days as string)
      const selectedDate = new Date(date)
      const dayOfWeek = selectedDate.getDay() // 0 = domingo, 1 = segunda, etc.
      
      return availableDays.includes(dayOfWeek)
    } catch {
      return true
    }
  }

  const handleBooking = async () => {
    if (!isSignedIn) {
      toast({
        title: "Login necessário",
        description: "Você precisa fazer login para agendar um serviço.",
      })
      router.push("/sign-in")
      return
    }

    if (!selectedService || !selectedDate || !selectedTime) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, selecione o serviço, data e horário.",
        variant: "destructive",
      })
      return
    }

    if (!isDateAvailable(selectedDate)) {
      toast({
        title: "Data não disponível",
        description: "O serviço não está disponível nesta data.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const service = salon.services.find((s) => s.id === selectedService)
      const scheduledAt = new Date(`${selectedDate}T${selectedTime}:00`)

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_id: selectedService,
          salon_id: salon.id,
          scheduled_at: scheduledAt.toISOString(),
          price_charged: service?.base_price || 0,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar agendamento")
      }

      toast({
        title: "Agendamento confirmado!",
        description: `Seu agendamento para ${service?.name} foi confirmado para ${new Date(scheduledAt).toLocaleDateString("pt-BR")} às ${selectedTime}.`,
      })

      // Reset form
      setSelectedDate("")
      setSelectedTime("")

      // Redirect to appointments page
      router.push("/appointments")
    } catch (error) {
      console.error("Erro ao criar agendamento:", error)
      toast({
        title: "Erro ao agendar",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao processar seu agendamento",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="sticky top-6">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4">Agendar serviço</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Selecione o serviço</label>
            <select
              className="w-full p-2 border rounded-md"
              value={selectedService}
              onChange={(e) => {
                setSelectedService(e.target.value)
                setSelectedTime("") // Reset time when service changes
              }}
            >
              {salon.services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} - R${service.base_price.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Selecione a data</label>
            <div className="flex items-center border rounded-md p-2">
              <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
              <input
                type="date"
                className="flex-1 bg-transparent outline-none"
                min={new Date().toISOString().split("T")[0]}
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value)
                  setSelectedTime("") // Reset time when date changes
                }}
              />
            </div>
            {selectedDate && !isDateAvailable(selectedDate) && (
              <p className="text-sm text-red-500 mt-1">
                Serviço não disponível nesta data
              </p>
            )}
          </div>

          {selectedDate && isDateAvailable(selectedDate) && (
            <div>
              <label className="block text-sm font-medium mb-1">Selecione o horário</label>
              <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                {generateTimeSlots().map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    className="text-sm"
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {!isSignedIn && (
            <div className="bg-muted p-3 rounded-md">
              <div className="flex items-center text-sm text-muted-foreground">
                <User className="h-4 w-4 mr-2" />
                <span>Você precisa fazer login para agendar</span>
              </div>
            </div>
          )}

          <Button 
            variant="accent" 
            className="w-full text-white" 
            onClick={handleBooking} 
            disabled={isLoading || (selectedDate && !isDateAvailable(selectedDate))}
          >
            {isLoading ? "Agendando..." : isSignedIn ? "Confirmar agendamento" : "Fazer login para agendar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}