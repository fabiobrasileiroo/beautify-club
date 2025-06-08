"use client"

import { useEffect } from "react"

import { useState } from "react"
import { useEnhancedGeolocation } from "@/hooks/use-enhanced-geolocation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, MapPin, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface LocationPickerProps {
  onLocationSelected: (latitude: number, longitude: number, source: string) => void
}

export function LocationPicker({ onLocationSelected }: LocationPickerProps) {
  const { latitude, longitude, accuracy, source, error, loading, setManualLocation } = useEnhancedGeolocation()
  const [address, setAddress] = useState("")
  const [addressLoading, setAddressLoading] = useState(false)

  // Função para buscar coordenadas a partir de um endereço usando a API do Google Maps
  const searchAddressCoordinates = async () => {
    if (!address.trim()) {
      toast({
        title: "Endereço vazio",
        description: "Por favor, digite um endereço para buscar",
        variant: "destructive",
      })
      return
    }

    setAddressLoading(true)
    try {
      // Usando a API de Geocodificação do Google Maps
      // Nota: Em produção, você precisaria de uma chave API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address,
        )}&key=YOUR_GOOGLE_MAPS_API_KEY`,
      )
      const data = await response.json()

      if (data.status === "OK" && data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location
        setManualLocation(lat, lng)
        onLocationSelected(lat, lng, "address")
        toast({
          title: "Localização encontrada",
          description: `Endereço: ${data.results[0].formatted_address}`,
        })
      } else {
        toast({
          title: "Endereço não encontrado",
          description: "Não foi possível encontrar coordenadas para este endereço",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro na busca",
        description: "Ocorreu um erro ao buscar as coordenadas do endereço",
        variant: "destructive",
      })
    } finally {
      setAddressLoading(false)
    }
  }

  // Quando a localização é obtida automaticamente
  useEffect(() => {
    if (latitude && longitude && !error && !loading) {
      onLocationSelected(latitude, longitude, source || "unknown")
    }
  }, [latitude, longitude, error, loading, source, onLocationSelected])

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <h3 className="text-sm font-medium">Sua localização atual</h3>

        {loading ? (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Obtendo sua localização...</span>
          </div>
        ) : error ? (
          <div className="flex items-center space-x-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        ) : latitude && longitude ? (
          <div className="text-sm">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-green-600" />
              <span>
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Fonte:{" "}
              {source === "gps" ? "GPS do dispositivo" : source === "ip" ? "Localização por IP" : "Entrada manual"}
              {accuracy && ` (precisão: ~${Math.round(accuracy)}m)`}
            </p>
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Ou busque por endereço</h3>
        <div className="flex space-x-2">
          <Input
            placeholder="Digite um endereço, cidade ou CEP"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="flex-1"
          />
          <Button onClick={searchAddressCoordinates} disabled={addressLoading}>
            {addressLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Buscar
          </Button>
        </div>
      </div>
    </div>
  )
}
