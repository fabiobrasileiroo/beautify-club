"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { ArrowRight, Scissors, Calendar, CreditCard } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"

export default function LandingPage() {
  const { isSignedIn, user, isLoaded } = useUser()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn && user) {
        // Se o usuário estiver logado, redirecionar com base no papel
        const role = user.publicMetadata?.role as string

        if (role === "ADMIN") {
          router.push("/admin/dashboard")
        } else if (role === "PARTNER") {
          router.push("/partner/dashboard")
        } else {
          router.push("/dashboard")
        }
      } else {
        setIsLoading(false)
      }
    }
  }, [isLoaded, isSignedIn, user, router])

  const handlePlanClick = () => {
    if (isSignedIn) {
      router.push("/plans")
    } else {
      router.push("/sign-up")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-primary text-2xl">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-secondary">
          <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 space-y-8 animate-slide-in-left">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground">Beleza ilimitada com um único plano</h1>
              <p className="text-lg md:text-xl text-foreground">
                Acesse os melhores salões e barbearias com uma assinatura mensal fixa. Agende serviços quando e onde
                quiser.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="default"
                  size="lg"
                  className="w-full sm:w-auto font-medium animate-fade-in animate-delay-200"
                  onClick={handlePlanClick}
                >
                  Ver planos
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Link href="/salons">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto font-medium animate-fade-in animate-delay-300"
                  >
                    Encontrar salões
                  </Button>
                </Link>
              </div>
            </div>
            <div className="lg:w-1/2 animate-slide-in-right">
              <Image
                src="/placeholder.svg?height=600&width=600"
                alt="Beautify Club"
                width={600}
                height={600}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground animate-slide-up">
              Como funciona
            </h2>
            <div className="grid md:grid-cols-3 gap-10">
              <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-md animate-slide-up animate-delay-100">
                <div className="bg-primary rounded-full p-4 mb-6">
                  <CreditCard className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-foreground">Escolha seu plano</h3>
                <p className="text-foreground">Assine um plano mensal que se encaixa no seu estilo e necessidades.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-md animate-slide-up animate-delay-200">
                <div className="bg-primary rounded-full p-4 mb-6">
                  <Scissors className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-foreground">Encontre salões</h3>
                <p className="text-foreground">Descubra os melhores salões e barbearias próximos a você.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-md animate-slide-up animate-delay-300">
                <div className="bg-primary rounded-full p-4 mb-6">
                  <Calendar className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-foreground">Agende serviços</h3>
                <p className="text-foreground">Marque horários facilmente e aproveite serviços ilimitados.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Plans Section */}
        <section className="py-20 bg-secondary">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground animate-slide-up">
              Nossos planos
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card rounded-lg shadow-lg overflow-hidden animate-slide-up animate-delay-100">
                <div className="p-8 bg-muted">
                  <h3 className="text-2xl font-bold text-foreground">Básico</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-5xl font-extrabold text-foreground">R$99</span>
                    <span className="ml-1 text-xl text-muted-foreground">/mês</span>
                  </div>
                </div>
                <div className="p-8">
                  <ul className="space-y-4">
                    <li className="flex items-center">
                      <svg
                        className="h-5 w-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="ml-3 text-foreground">4 serviços por mês</span>
                    </li>
                    <li className="flex items-center">
                      <svg
                        className="h-5 w-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="ml-3 text-foreground">Acesso a salões parceiros</span>
                    </li>
                    <li className="flex items-center">
                      <svg
                        className="h-5 w-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="ml-3 text-foreground">Agendamento pelo app</span>
                    </li>
                  </ul>
                  <Button variant="default" className="w-full mt-8 font-medium" onClick={handlePlanClick}>
                    Assinar agora
                  </Button>
                </div>
              </div>
              <div className="bg-card rounded-lg shadow-lg overflow-hidden transform scale-105 z-10 border-2 border-primary animate-slide-up animate-delay-200">
                <div className="p-8 bg-primary">
                  <h3 className="text-2xl font-bold text-primary-foreground">Padrão</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-5xl font-extrabold text-primary-foreground">R$199</span>
                    <span className="ml-1 text-xl text-primary-foreground opacity-80">/mês</span>
                  </div>
                </div>
                <div className="p-8">
                  <ul className="space-y-4">
                    <li className="flex items-center">
                      <svg
                        className="h-5 w-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="ml-3 text-foreground">8 serviços por mês</span>
                    </li>
                    <li className="flex items-center">
                      <svg
                        className="h-5 w-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="ml-3 text-foreground">Acesso a todos os salões</span>
                    </li>
                    <li className="flex items-center">
                      <svg
                        className="h-5 w-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="ml-3 text-foreground">Agendamento prioritário</span>
                    </li>
                    <li className="flex items-center">
                      <svg
                        className="h-5 w-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="ml-3 text-foreground">Descontos em produtos</span>
                    </li>
                  </ul>
                  <Button variant="default" className="w-full mt-8 font-medium" onClick={handlePlanClick}>
                    Assinar agora
                  </Button>
                </div>
              </div>
              <div className="bg-card rounded-lg shadow-lg overflow-hidden animate-slide-up animate-delay-300">
                <div className="p-8 bg-muted">
                  <h3 className="text-2xl font-bold text-foreground">Premium</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-5xl font-extrabold text-foreground">R$299</span>
                    <span className="ml-1 text-xl text-muted-foreground">/mês</span>
                  </div>
                </div>
                <div className="p-8">
                  <ul className="space-y-4">
                    <li className="flex items-center">
                      <svg
                        className="h-5 w-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="ml-3 text-foreground">Serviços ilimitados</span>
                    </li>
                    <li className="flex items-center">
                      <svg
                        className="h-5 w-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="ml-3 text-foreground">Acesso VIP a todos os salões</span>
                    </li>
                    <li className="flex items-center">
                      <svg
                        className="h-5 w-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="ml-3 text-foreground">Workshops exclusivos</span>
                    </li>
                    <li className="flex items-center">
                      <svg
                        className="h-5 w-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="ml-3 text-foreground">Produtos premium inclusos</span>
                    </li>
                  </ul>
                  <Button variant="default" className="w-full mt-8 font-medium" onClick={handlePlanClick}>
                    Assinar agora
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground animate-slide-up">
              O que nossos clientes dizem
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card p-8 rounded-lg shadow-md animate-slide-up animate-delay-100">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                    M
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold text-foreground">Maria Silva</h4>
                    <p className="text-sm text-muted-foreground">Cliente há 6 meses</p>
                  </div>
                </div>
                <p className="text-foreground">
                  "Beautify Club mudou minha rotina de beleza. Agora posso experimentar diferentes salões sem me
                  preocupar com custos extras."
                </p>
              </div>
              <div className="bg-card p-8 rounded-lg shadow-md animate-slide-up animate-delay-200">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                    J
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold text-foreground">João Santos</h4>
                    <p className="text-sm text-muted-foreground">Cliente há 3 meses</p>
                  </div>
                </div>
                <p className="text-foreground">
                  "Como homem que gosta de manter o visual em dia, o Beautify Club é perfeito. Visito minha barbearia
                  favorita toda semana."
                </p>
              </div>
              <div className="bg-card p-8 rounded-lg shadow-md animate-slide-up animate-delay-300">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                    C
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold text-foreground">Carla Oliveira</h4>
                    <p className="text-sm text-muted-foreground">Cliente há 1 ano</p>
                  </div>
                </div>
                <p className="text-foreground">
                  "O plano premium vale cada centavo! Faço unhas, cabelo e massagens regularmente, economizando muito
                  dinheiro no final do mês."
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-secondary border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4 text-foreground">Beautify Club</h3>
              <p className="text-foreground">
                Transformando a experiência de beleza com assinaturas que cabem no seu bolso.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4 text-foreground">Links Rápidos</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/plans" className="text-foreground hover:text-primary">
                    Planos
                  </Link>
                </li>
                <li>
                  <Link href="/salons" className="text-foreground hover:text-primary">
                    Salões
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-foreground hover:text-primary">
                    Sobre nós
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-foreground hover:text-primary">
                    Contato
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4 text-foreground">Para Parceiros</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/partner/register" className="text-foreground hover:text-primary">
                    Torne-se um parceiro
                  </Link>
                </li>
                <li>
                  <Link href="/partner/login" className="text-foreground hover:text-primary">
                    Login de parceiros
                  </Link>
                </li>
                <li>
                  <Link href="/partner/resources" className="text-foreground hover:text-primary">
                    Recursos
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4 text-foreground">Contato</h3>
              <ul className="space-y-2">
                <li className="text-foreground">contato@beautifyclub.com</li>
                <li className="text-foreground">(11) 99999-9999</li>
                <li className="text-foreground">São Paulo, SP</li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 text-center text-foreground">
            <p>&copy; {new Date().getFullYear()} Beautify Club. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
