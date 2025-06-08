"use client"

import { useEffect, useRef } from "react"

interface MapViewProps {
  latitude: number
  longitude: number
  zoom?: number
}

export function MapView({ latitude, longitude, zoom = 15 }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Esta é uma implementação simples usando iframe do OpenStreetMap
    // Para uma solução mais robusta, você pode usar bibliotecas como Leaflet
    if (mapContainerRef.current) {
      const iframe = document.createElement("iframe")
      iframe.width = "100%"
      iframe.height = "100%"
      iframe.frameBorder = "0"
      iframe.scrolling = "no"
      iframe.marginHeight = 0
      iframe.marginWidth = 0
      iframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01}%2C${latitude - 0.01}%2C${longitude + 0.01}%2C${latitude + 0.01}&amp;layer=mapnik&amp;marker=${latitude}%2C${longitude}`
      iframe.style.border = "none"

      // Limpa o container e adiciona o iframe
      mapContainerRef.current.innerHTML = ""
      mapContainerRef.current.appendChild(iframe)
    }
  }, [latitude, longitude, zoom])

  return (
    <div className="w-full h-full min-h-[200px] border rounded-md overflow-hidden" ref={mapContainerRef}>
      <div className="flex items-center justify-center h-full bg-muted/30 text-muted-foreground">
        Carregando mapa...
      </div>
    </div>
  )
}
