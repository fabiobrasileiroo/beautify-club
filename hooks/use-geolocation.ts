"use client"

import { useState, useEffect } from "react"

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  error: string | null
  loading: boolean
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocalização não é suportada pelo seu navegador",
        loading: false,
      }))
      return
    }

    const success = (position: GeolocationPosition) => {
      setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        error: null,
        loading: false,
      })
    }

    const error = (error: GeolocationPositionError) => {
      setState((prev) => ({
        ...prev,
        error: error.message,
        loading: false,
      }))
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    }

    navigator.geolocation.getCurrentPosition(success, error, options)
  }, [])
  console.log('state',state)
  return state
}
