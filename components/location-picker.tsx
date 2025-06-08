"use client"

import { useEffect, useState } from "react"
import { useEnhancedGeolocation } from "@/hooks/use-enhanced-geolocation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, MapPin, AlertCircle, Search } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface LocationPickerProps {
  onLocationSelected: (latitude: number, longitude: number, source: string) => void
}

export function LocationPicker({ onLocationSelected }: LocationPickerProps) {
  const { latitude, longitude, accuracy, source, error, loading, setManualLocation } = useEnhancedGeolocation()
  const [address, setAddress] = useState("")
  const [addressLoading, setAddressLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)

  // Função para buscar coordenadas a partir de um endereço usando Nominatim (OpenStreetMap)
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
    setSearchResults([])
    console.log('aqui2',address)
    try {
      // Usando a API Nominatim do OpenStreetMap (gratuita)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=5&addressdetails=1`,
        {
          headers: {
            // Importante: Adicionar um User-Agent válido conforme as regras do Nominatim
            "User-Agent": "BeautifyClub/1.0",
          },
        },
      )

      const data = await response.json()

      if (data && data.length > 0) {
        setSearchResults(data)
        setShowResults(true)
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

  const selectSearchResult = (result: any) => {
    const lat = Number.parseFloat(result.lat)
    const lon = Number.parseFloat(result.lon)

    setManualLocation(lat, lon)
    onLocationSelected(lat, lon, "address")

    // Atualiza o campo de endereço com o resultado selecionado
    setAddress(result.display_name)
    setShowResults(false)

    toast({
      title: "Localização definida",
      description: `Endereço: ${result.display_name}`,
    })
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
          <div className="relative flex-1">
            <Input
              placeholder="Digite um endereço, cidade ou CEP"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full"
            />

            {/* Resultados da busca */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="p-2 hover:bg-accent cursor-pointer text-sm border-b last:border-0"
                    onClick={() => selectSearchResult(result)}
                  >
                    <div className="font-medium">{result.display_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {result.type}: {result.lat}, {result.lon}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button onClick={searchAddressCoordinates} disabled={addressLoading}>
            {addressLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
            Buscar
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Usando OpenStreetMap para busca de endereços (gratuito)</p>
      </div>

      {/* Visualização do mapa */}
      {latitude && longitude && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Visualização do mapa</h3>
          <div className="border rounded-md overflow-hidden h-[200px] bg-muted/30">
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01}%2C${latitude - 0.01}%2C${longitude + 0.01}%2C${latitude + 0.01}&amp;layer=mapnik&amp;marker=${latitude}%2C${longitude}`}
              style={{ border: "none" }}
              title="Mapa de localização"
            />
          </div>
          <div className="mt-1 text-xs text-right">
            <a
              href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Ver no OpenStreetMap
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
