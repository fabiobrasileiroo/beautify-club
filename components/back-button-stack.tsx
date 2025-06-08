'use client'
import { useRouter } from "next/navigation"
import { Button } from "./ui/button"
import { ChevronLeft } from "lucide-react"

export function BackButtonStack() {
  const router = useRouter()
  return (
    <Button className="cursor-pointer" onClick={() => { router.back() }}>
      <ChevronLeft strokeWidth={3} /> Voltar
    </Button>
  )
}