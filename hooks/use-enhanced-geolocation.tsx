"use client"

import { useState, useEffect } from "react"

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  source: "gps" | "ip" | "manual" | null
  error: string | null
  loading: boolean
}

export const useEnhancedGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    source: null,
    error: null,
    loading: true,
  })

  useEffect(() => {
    // Primeiro tenta usar a API de Geolocalização do navegador
    const tryBrowserGeolocation = () => {
      if (!navigator.geolocation) {
        console.log("Geolocalização do navegador não suportada, tentando IP...")
        tryIpGeolocation()
        return
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            source: "gps",
            error: null,
            loading: false,
          })
        },
        (error) => {
          console.log(`Erro na geolocalização do navegador: ${error.message}, tentando IP...`)
          tryIpGeolocation()
        },
        options,
      )
    }

    // Se a geolocalização do navegador falhar, tenta por IP
    const tryIpGeolocation = async () => {
      try {
        // Usando o serviço ipapi.co (gratuito com limites)
        const response = await fetch("https://ipapi.co/json/")
        const data = await response.json()

        if (data.latitude && data.longitude) {
          setState({
            latitude: data.latitude,
            longitude: data.longitude,
            accuracy: 5000, // Precisão estimada em metros (geralmente baixa para geolocalização por IP)
            source: "ip",
            error: null,
            loading: false,
          })
        } else {
          setState((prev) => ({
            ...prev,
            error: "Não foi possível determinar a localização por IP",
            loading: false,
          }))
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: "Falha ao obter localização por IP",
          loading: false,
        }))
      }
    }

    tryBrowserGeolocation()
  }, [])

  // Função para definir manualmente a localização
  const setManualLocation = (latitude: number, longitude: number) => {
    setState({
      latitude,
      longitude,
      accuracy: null,
      source: "manual",
      error: null,
      loading: false,
    })
  }

  return {
    ...state,
    setManualLocation,
  }
}
