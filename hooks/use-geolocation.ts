// hooks/useGeolocation.ts
"use client"

import { useState, useEffect } from "react"

export interface GeolocationState {
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
    if (typeof window === "undefined" || !navigator.geolocation) {
      setState({
        latitude: null,
        longitude: null,
        error: "Geolocalização não é suportada pelo navegador",
        loading: false,
      })
      return
    }

    navigator.permissions
      .query({ name: "geolocation" })
      .then((perm) => {
        if (perm.state === "denied") {
          setState({
            latitude: null,
            longitude: null,
            error: "Permissão de localização negada",
            loading: false,
          })
        }
      })
      .catch(() => {})

    const success = (pos: GeolocationPosition) => {
      setState({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        error: null,
        loading: false,
      })
    }

    const fail = (err: GeolocationPositionError) => {
      let msg = err.message
      switch (err.code) {
        case err.PERMISSION_DENIED:
          msg = "Permissão negada pelo usuário"
          break
        case err.POSITION_UNAVAILABLE:
          msg = "Posição indisponível"
          break
        case err.TIMEOUT:
          msg = "Tempo para obter localização excedido"
          break
      }
      setState({ latitude: null, longitude: null, error: msg, loading: false })
    }

    const options: PositionOptions = {
      enableHighAccuracy: false,
      timeout: 20000,
      maximumAge: 0,
    }

    navigator.geolocation.getCurrentPosition(success, fail, options)
  }, [])

  return state
}