"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface LeafletMapProps {
  latitude: number
  longitude: number
  zoom?: number
}

export function LeafletMap({ latitude, longitude, zoom = 15 }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current) return

    // Inicializa o mapa se ainda não existir
    if (!mapInstanceRef.current) {
      // Corrige o problema dos ícones do Leaflet
      // Isso é necessário porque o Leaflet espera que os ícones estejam em um caminho específico
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      })

      // Cria o mapa
      mapInstanceRef.current = L.map(mapRef.current).setView([latitude, longitude], zoom)

      // Adiciona a camada do OpenStreetMap
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current)

      // Adiciona o marcador
      L.marker([latitude, longitude]).addTo(mapInstanceRef.current)
    } else {
      // Atualiza a visualização e o marcador se o mapa já existir
      mapInstanceRef.current.setView([latitude, longitude], zoom)

      // Remove marcadores antigos e adiciona um novo
      mapInstanceRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          mapInstanceRef.current?.removeLayer(layer)
        }
      })

      L.marker([latitude, longitude]).addTo(mapInstanceRef.current)
    }

    // Limpa o mapa quando o componente for desmontado
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [latitude, longitude, zoom])

  return <div ref={mapRef} className="w-full h-full min-h-[300px]" />
}
