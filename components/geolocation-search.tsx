// components/GeolocationSearch.tsx
"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Search, Loader2 } from "lucide-react"
import { useGeolocation } from "@/hooks/use-geolocation"

export function GeolocationSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const [location, setLocation]   = useState(searchParams.get("location") || "")
  const [isSearching, setIsSearching] = useState(false)
  const { latitude, longitude, loading, error } = useGeolocation()

  const handleSearch = () => {
    setIsSearching(true)
    const params = new URLSearchParams()
    if (searchTerm) params.set("search", searchTerm)
    if (location)   params.set("location", location)
    if (latitude && longitude) {
      params.set("lat", latitude.toString())
      params.set("lng", longitude.toString())
    }
    router.push(`/salons?${params.toString()}`)
    setIsSearching(false)
  }

  const handleUseMyLocation = async () => {
    if (!latitude || !longitude) return

    setIsSearching(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        { headers: { "User-Agent": "MeuApp/1.0 (meuemail@dominio.com)" } }
      )
      if (!res.ok) throw new Error("Falha no geocoding")
      const data = await res.json()
      const addr = data.address
      const place = [
        addr.neighbourhood || addr.suburb,
        addr.city || addr.town || addr.village,
        addr.state
      ]
        .filter(Boolean)
        .join(", ")
      setLocation(place || data.display_name)
    } catch {
      setLocation("Endereço não disponível")
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="bg-secondary rounded-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por nome"
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Localização"
            className="pl-10"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 md:mt-0 md:absolute md:right-2 md:top-1/2 md:-translate-y-1/2 text-xs"
            onClick={handleUseMyLocation}
            disabled={loading || !!error || isSearching}
          >
            {(loading || isSearching) ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Carregando...
              </>
            ) : (
              "Usar minha localização"
            )}
          </Button>
        </div>

        <Button
          variant="accent"
          className="text-white"
          onClick={handleSearch}
          disabled={isSearching}
        >
          {isSearching ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Buscando...
            </>
          ) : (
            "Buscar"
          )}
        </Button>
      </div>
    </div>
  )
}
