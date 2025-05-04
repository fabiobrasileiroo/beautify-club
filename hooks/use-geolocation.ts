// hooks/useGeolocation.ts
"use client"

import { useState, useEffect } from "react"

export interface GeolocationState {
  latitude: number | null
  longitude: number | null
  error: string | null
  loading: boolean
  source: 'gps' | 'ip' | null
}

export const useGeolocation = (): GeolocationState => {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
    source: null,
  })

  useEffect(() => {
    if (typeof window === "undefined") {
      setState({ latitude: null, longitude: null, error: "Execução no servidor", loading: false, source: null })
      return
    }
    if (!navigator.geolocation) {
      fetchIPLocation()
      return
    }

    const handleIPFallback = () => {
      // fallback para geolocalização por IP
      fetchIPLocation()
    }

    const success = (pos: GeolocationPosition) => {
      setState({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        error: null,
        loading: false,
        source: 'gps',
      })
    }

    const fail = (err: GeolocationPositionError) => {
      console.warn("Geolocalização GPS falhou:", err.message)
      // tenta fallback por IP
      handleIPFallback()
    }

    const options: PositionOptions = {
      enableHighAccuracy: false,
      timeout: 15000,
      maximumAge: 0,
    }

    navigator.geolocation.getCurrentPosition(success, fail, options)

    // função para buscar por IP
    function fetchIPLocation() {
      fetch("https://ipapi.co/json")
        .then((res) => {
          if (!res.ok) throw new Error("IP lookup falhou")
          return res.json()
        })
        .then((data) => {
          const lat = parseFloat(data.latitude)
          const lng = parseFloat(data.longitude)
          if (!isNaN(lat) && !isNaN(lng)) {
            setState({
              latitude: lat,
              longitude: lng,
              error: null,
              loading: false,
              source: 'ip',
            })
          } else {
            throw new Error("Dados de IP inválidos")
          }
        })
        .catch((e) => {
          console.error("Falha no fallback por IP:", e)
          setState({
            latitude: null,
            longitude: null,
            error: "Não foi possível obter localização",
            loading: false,
            source: null,
          })
        })
    }
  }, [])

  return state
}