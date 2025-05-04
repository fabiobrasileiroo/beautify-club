"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton, useUser } from "@clerk/nextjs"
import { Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { useMobile } from "@/hooks/use-mobile"

export function Navbar() {
  const { isSignedIn, user } = useUser()
  const pathname = usePathname()
  const isMobile = useMobile()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  const userRole = (user?.publicMetadata?.role as string) || "CLIENT"

  const renderNavLinks = () => {
    if (!isSignedIn) {
      return (
        <>
          <Link href="/sign-in" onClick={closeMenu}>
            <Button variant="ghost" className={isActive("/sign-in") ? "bg-secondary" : ""}>
              Entrar
            </Button>
          </Link>
          <Link href="/sign-up" onClick={closeMenu}>
            <Button variant="accent" className="text-white font-medium">
              Cadastrar
            </Button>
          </Link>
        </>
      )
    }

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
          <Link href="/admin/reports" onClick={closeMenu}>
            <Button variant="ghost" className={isActive("/admin/reports") ? "bg-secondary font-medium" : ""}>
              Relatórios
            </Button>
          </Link>
        </>
      )
    }

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
          <Link href="/partner/reports" onClick={closeMenu}>
            <Button variant="ghost" className={isActive("/partner/reports") ? "bg-secondary font-medium" : ""}>
              Relatórios
            </Button>
          </Link>
        </>
      )
    }

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
      </>
    )
  }

  return (
    <nav className="w-full bg-primary border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2" onClick={closeMenu}>
          <span className="font-bold text-2xl text-foreground">Beautify Club</span>
        </Link>

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
