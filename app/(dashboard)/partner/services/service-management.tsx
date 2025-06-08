// service-management.tsx
"use client"

import { useState, useEffect } from "react"
import { ServicesTable } from "./service-table"
import { ServiceForm } from "./service-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

// Tipo que representa o serviço como vem do banco de dados
interface ServiceFromDB {
  id: string
  name: string
  description: string
  base_price: number
  duration_min: number
  available_days: any // JsonValue | null
  available_start_time: string
  available_end_time: string
  created_at: Date
  updated_at: Date
  salon_id: string
}

// Tipo que representa o serviço normalizado para uso no frontend
interface Service {
  id: string
  name: string
  description: string
  base_price: number
  duration_min: number
  available_days: string[]
  available_start_time: string
  available_end_time: string
  created_at: string
  updated_at: string
}

// Função para converter serviço do DB para o formato do frontend
function normalizeService(serviceFromDB: ServiceFromDB): Service {
  return {
    id: serviceFromDB.id,
    name: serviceFromDB.name,
    description: serviceFromDB.description,
    base_price: serviceFromDB.base_price,
    duration_min: serviceFromDB.duration_min,
    available_days: Array.isArray(serviceFromDB.available_days) 
      ? serviceFromDB.available_days 
      : [],
    available_start_time: serviceFromDB.available_start_time,
    available_end_time: serviceFromDB.available_end_time,
    created_at: serviceFromDB.created_at.toISOString(),
    updated_at: serviceFromDB.updated_at.toISOString(),
  }
}

interface ServicesManagementProps {
  initialServices: ServiceFromDB[]
  salonId: string
}

export function ServicesManagement({ initialServices, salonId }: ServicesManagementProps) {
  // Normalizar os serviços iniciais
  const [services, setServices] = useState<Service[]>(
    initialServices.map(normalizeService)
  )
  const [showForm, setShowForm] = useState(false)
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchServices = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/partner/services?salonId=${salonId}`)
      if (response.ok) {
        const data = await response.json()
        // Normalizar os serviços que vêm da API
        const normalizedServices = (data.services || []).map((service: any) => {
          return {
            id: service.id,
            name: service.name,
            description: service.description,
            base_price: service.base_price,
            duration_min: service.duration_min,
            available_days: Array.isArray(service.available_days) 
              ? service.available_days 
              : [],
            available_start_time: service.available_start_time,
            available_end_time: service.available_end_time,
            created_at: service.created_at,
            updated_at: service.updated_at,
          }
        })
        setServices(normalizedServices)
      }
    } catch (error) {
      console.error("Erro ao buscar serviços:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddNew = () => {
    setEditingServiceId(null)
    setShowForm(true)
  }

  const handleEdit = (serviceId: string) => {
    setEditingServiceId(serviceId)
    setShowForm(true)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingServiceId(null)
    fetchServices()
  }

  const handleBackToTable = () => {
    setShowForm(false)
    setEditingServiceId(null)
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={handleBackToTable}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para serviços
          </Button>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">
              {editingServiceId ? 'Editar Serviço' : 'Adicionar Novo Serviço'}
            </h2>
            <p className="text-muted-foreground">
              {editingServiceId 
                ? 'Atualize as informações do seu serviço' 
                : 'Crie um novo serviço para seu estabelecimento'
              }
            </p>
          </div>
          
          <ServiceForm 
            salonId={salonId}
            serviceId={editingServiceId}
            onSuccess={handleFormSuccess}
            onCancel={handleBackToTable}
          />
        </div>
      </div>
    )
  }

  return (
    <ServicesTable
      services={services}
      salonId={salonId}
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onRefresh={fetchServices}
      isLoading={isLoading}
    />
  )
}