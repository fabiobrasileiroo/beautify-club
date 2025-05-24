"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { UserButton, useUser } from "@clerk/nextjs"
import { Menu, X } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { useMobile } from "@/hooks/use-mobile"
import { ThemeProvider } from "./theme-provider"
import { useTheme } from "next-themes"

export function Navbar() {
  const { isSignedIn, user, isLoaded } = useUser()
  const { resolvedTheme } = useTheme()
  console.log("🚀 ~ Navbar ~ resolvedTheme:", resolvedTheme)
  const pathname = usePathname()
  const router = useRouter()
  const isMobile = useMobile()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    if (isLoaded && user) {
      const role = user.publicMetadata?.role as string
      setUserRole(role || "CLIENT")

      // Verificar se o papel está correto no banco de dados
      const checkUserRole = async () => {
        try {
          const response = await fetch("/api/user/check-role")
          if (response.ok) {
            const data = await response.json()

            // Se o papel no banco de dados for diferente do papel nos metadados, atualizar a UI
            if (data.role && data.role !== role) {
              setUserRole(data.role)
              // Forçar um refresh para atualizar os metadados do Clerk
              window.location.reload()
            }
          }
        } catch (error) {
          console.error("Erro ao verificar papel do usuário:", error)
        }
      }

      checkUserRole()

      // Redirecionar com base no papel do usuário se estiver na página errada
      if (role === "ADMIN" && !pathname.startsWith("/admin")) {
        router.push("/admin/dashboard")
      } else if (role === "PARTNER" && !pathname.startsWith("/partner")) {
        router.push("/partner/dashboard")
      } else if (role === "CLIENT" && (pathname.startsWith("/admin") || pathname.startsWith("/partner"))) {
        router.push("/dashboard")
      }
    }
  }, [isLoaded, user, pathname, router])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isSignedIn) {
      // Redirecionar com base no papel do usuário
      if (userRole === "ADMIN") {
        router.push("/admin/dashboard")
      } else if (userRole === "PARTNER") {
        router.push("/partner/dashboard")
      } else {
        router.push("/dashboard")
      }
    } else {
      // Se não estiver logado, vai para a landing page
      router.push("/")
    }
    closeMenu()
  }

  const renderNavLinks = () => {
    // Se não estiver carregado ainda, não mostrar nada
    if (!isLoaded) {
      return null
    }

    // Se não estiver logado, mostrar links de login/cadastro
    if (!isSignedIn) {
      return (
        <>
          <Link href="/sign-in" onClick={closeMenu}>
            <Button variant="ghost" className={isActive("/sign-in") ? "bg-secondary" : ""}>
              Entrar
            </Button>
          </Link>
          <Link href="/sign-up" onClick={closeMenu}>
            <Button variant="default" className="font-medium">
              Cadastrar
            </Button>
          </Link>
        </>
      )
    }

    // Links específicos para administradores
    if (userRole === "ADMIN") {
      return (
        <>
          <Link href="/admin/dashboard" onClick={closeMenu}>
            <Button variant="ghost" className={isActive("/admin/dashboard") ? "bg-secondary font-medium" : ""}>
              Dashboard
            </Button>
          </Link>
          <Link href="/admin/partners" onClick={closeMenu}>
            <Button variant="ghost" className={isActive("/admin/partners") ? "bg-secondary font-medium" : ""}>
              Parceiros
            </Button>
          </Link>
          <Link href="/admin/plans" onClick={closeMenu}>
            <Button variant="ghost" className={isActive("/admin/plans") ? "bg-secondary font-medium" : ""}>
              Planos
            </Button>
          </Link>
          <Link href="/admin/users" onClick={closeMenu}>
            <Button variant="ghost" className={isActive("/admin/users") ? "bg-secondary font-medium" : ""}>
              Usuários
            </Button>
          </Link>
          <Link href="/admin/finances" onClick={closeMenu}>
            <Button variant="ghost" className={isActive("/admin/finances") ? "bg-secondary font-medium" : ""}>
              Finanças
            </Button>
          </Link>
          <Link href="/profile" onClick={closeMenu}>
            <Button variant="ghost" className={isActive("/profile") ? "bg-secondary font-medium" : ""}>
              Perfil
            </Button>
          </Link>
        </>
      )
    }

    // Links específicos para parceiros
    if (userRole === "PARTNER") {
      return (
        <>
          <Link href="/partner/dashboard" onClick={closeMenu}>
            <Button variant="ghost" className={isActive("/partner/dashboard") ? "bg-secondary font-medium" : ""}>
              Dashboard
            </Button>
          </Link>
          <Link href="/partner/services" onClick={closeMenu}>
            <Button variant="ghost" className={isActive("/partner/services") ? "bg-secondary font-medium" : ""}>
              Serviços
            </Button>
          </Link>
          <Link href="/partner/appointments" onClick={closeMenu}>
            <Button variant="ghost" className={isActive("/partner/appointments") ? "bg-secondary font-medium" : ""}>
              Agendamentos
            </Button>
          </Link>
          <Link href="/partner/finances" onClick={closeMenu}>
            <Button variant="ghost" className={isActive("/partner/finances") ? "bg-secondary font-medium" : ""}>
              Finanças
            </Button>
          </Link>
          <Link href="/profile" onClick={closeMenu}>
            <Button variant="ghost" className={isActive("/profile") ? "bg-secondary font-medium" : ""}>
              Perfil
            </Button>
          </Link>
        </>
      )
    }

    // Links para clientes (padrão)
    return (
      <>
        <Link href="/dashboard" onClick={closeMenu}>
          <Button variant="ghost" className={isActive("/dashboard") ? "bg-secondary font-medium" : ""}>
            Dashboard
          </Button>
        </Link>
        <Link href="/salons" onClick={closeMenu}>
          <Button variant="ghost" className={isActive("/salons") ? "bg-secondary font-medium" : ""}>
            Salões
          </Button>
        </Link>
        <Link href="/appointments" onClick={closeMenu}>
          <Button variant="ghost" className={isActive("/appointments") ? "bg-secondary font-medium" : ""}>
            Agendamentos
          </Button>
        </Link>
        <Link href="/plans" onClick={closeMenu}>
          <Button variant="ghost" className={isActive("/plans") ? "bg-secondary font-medium" : ""}>
            Planos
          </Button>
        </Link>
        <Link href="/profile" onClick={closeMenu}>
          <Button variant="ghost" className={isActive("/profile") ? "bg-secondary font-medium" : ""}>
            Perfil
          </Button>
        </Link>
      </>
    )
  }

  return (
    <nav className="w-full bg-card border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <a href="#" onClick={handleLogoClick} className="flex items-center space-x-2">
          {/* <span className="font-bold text-2xl text-foreground">Beautify Club</span> */}
          <div className="scale-125 transition-transform duration-300 ">
            {resolvedTheme === "dark" ?
              <Image
                src="/logo-no-background-dark.png"
                className="rounded-md"
                width={100}
                height={100}
                alt="logo"
              />
              :
              <Image
                src="/logo-no-background-light.png"
                className="rounded-md"
                width={100}
                height={100}
                alt="logo"
              />
            }
          </div>

        </a>

        {isMobile ? (
          <>
            <div className="flex items-center space-x-2">
              {isSignedIn && <UserButton afterSignOutUrl="/" />}
              <ModeToggle />
              <Button variant="ghost" onClick={toggleMenu} className="p-2">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </Button>
            </div>
            {isMenuOpen && (
              <div className="fixed inset-0 top-16 z-50 bg-background">
                <div className="flex flex-col items-center pt-8 space-y-4">{renderNavLinks()}</div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center space-x-2">
            {renderNavLinks()}
            {isSignedIn && <UserButton afterSignOutUrl="/" />}
            <ModeToggle />
          </div>
        )}
      </div>
    </nav>
  )
}
