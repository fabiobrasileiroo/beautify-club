// hooks/useGeolocation.ts
"use client"

import { useState, useEffect } from "react"

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  error: string | null
  loading: boolean
}

export const useGeolocation = (): GeolocationState => {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
  })

  useEffect(() => {
    // Só roda no cliente
    if (typeof window === "undefined" || !navigator.geolocation) {
      setState({
        latitude: null,
        longitude: null,
        error: "Geolocalização não é suportada pelo navegador",
        loading: false,
      })
      return
    }

    // Primeiro, checar o status da permissão (opcional, mas útil):
    navigator.permissions
      .query({ name: "geolocation" })
      .then((permissionStatus) => {
        if (permissionStatus.state === "denied") {
          setState({
            latitude: null,
            longitude: null,
            error: "Permissão de localização negada",
            loading: false,
          })
        }
      })
      .catch(() => {
        // pode ignorar erros nessa query, pois nem todos os navegadores suportam
      })

    const success = (pos: GeolocationPosition) => {
      setState({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        error: null,
        loading: false,
      })
    }

    const fail = (err: GeolocationPositionError) => {
      let message = err.message
      switch (err.code) {
        case err.PERMISSION_DENIED:
          message = "Permissão negada pelo usuário"
          break
        case err.POSITION_UNAVAILABLE:
          message = "Posição indisponível"
          break
        case err.TIMEOUT:
          message = "Tempo para obter localização excedido"
          break
      }
      setState({
        latitude: null,
        longitude: null,
        error: message,
        loading: false,
      })
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,      // 10 segundos, aumenta chance de sucesso
      maximumAge: 0,
    }

    // Tenta obter a posição uma vez
    navigator.geolocation.getCurrentPosition(success, fail, options)

    // Se quiser monitorar mudanças na posição, ao invés de apenas uma vez:
    // const watcherId = navigator.geolocation.watchPosition(success, fail, options)
    // return () => { navigator.geolocation.clearWatch(watcherId) }

  }, [])

  console.log("🚀 ~ useGeolocation ~ state:", state)
  return state
}
