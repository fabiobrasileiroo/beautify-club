import { notFound } from "next/navigation"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Clock, Calendar, Phone, Star } from "lucide-react"

import prismadb from "@/lib/prisma"

interface SalonPageProps {
  params: {
    salonId: string
  }
}

export default async function SalonPage({ params }: SalonPageProps) {
  const salon = await prismadb.salon.findUnique({
    where: {
      id: params.salonId,
    },
    include: {
      services: true,
    },
  })

  if (!salon) {
    return notFound()
  }

  return (
    <div className="space-y-8">
      <div className="h-64 md:h-96 relative rounded-lg overflow-hidden">
        <Image src="/placeholder.svg?height=800&width=1600" alt={salon.name} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 text-white">
          <h1 className="text-3xl md:text-4xl font-bold">{salon.name}</h1>
          <div className="flex items-center mt-2">
            <div className="flex mr-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-5 w-5 text-yellow-500 mr-1" fill="currentColor" />
              ))}
            </div>
            <span>5.0 (120 avaliações)</span>
          </div>
          <div className="flex items-center mt-2">
            <MapPin className="h-5 w-5 mr-2" />
            <span>{salon.address}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue="services">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="services">Serviços</TabsTrigger>
              <TabsTrigger value="about">Sobre</TabsTrigger>
              <TabsTrigger value="reviews">Avaliações</TabsTrigger>
            </TabsList>
            <TabsContent value="services" className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Serviços disponíveis</h2>
              {salon.services.map((service) => (
                <Card key={service.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-medium mb-2">{service.name}</h3>
                        <p className="text-muted-foreground mb-4">{service.description}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{service.duration_min} minutos</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold">R${service.base_price.toFixed(2)}</span>
                        <Button variant="accent" className="mt-4 text-white">
                          Agendar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="about">
              <h2 className="text-2xl font-bold mb-4">Sobre o salão</h2>
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-6">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam
                    ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl. Nullam euismod, nisl eget
                    aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-3 text-accent" />
                      <div>
                        <h4 className="font-medium">Horário de funcionamento</h4>
                        <p className="text-sm text-muted-foreground">Seg - Sex: 9h às 20h</p>
                        <p className="text-sm text-muted-foreground">Sáb: 9h às 18h</p>
                        <p className="text-sm text-muted-foreground">Dom: Fechado</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 mr-3 text-accent" />
                      <div>
                        <h4 className="font-medium">Contato</h4>
                        <p className="text-sm text-muted-foreground">{salon.contact_info}</p>
                        <p className="text-sm text-muted-foreground">contato@salao.com</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reviews">
              <h2 className="text-2xl font-bold mb-4">Avaliações</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border-b pb-6 last:border-0 last:pb-0">
                        <div className="flex items-center mb-2">
                          <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center mr-3">
                            <span className="font-medium">C{i}</span>
                          </div>
                          <div>
                            <h4 className="font-medium">Cliente {i}</h4>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className="h-4 w-4 text-yellow-500" fill="currentColor" />
                              ))}
                              <span className="text-xs text-muted-foreground ml-2">há 3 dias</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-muted-foreground">
                          Excelente atendimento! O profissional foi muito atencioso e o resultado ficou perfeito.
                          Recomendo a todos.
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card className="sticky top-6">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Agendar serviço</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Selecione o serviço</label>
                  <select className="w-full p-2 border rounded-md">
                    {salon.services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} - R${service.base_price.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Selecione a data</label>
                  <div className="flex items-center border rounded-md p-2">
                    <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                    <input
                      type="date"
                      className="flex-1 bg-transparent outline-none"
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Selecione o horário</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"].map((time) => (
                      <Button key={time} variant="outline" className="text-sm">
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>
                <Button variant="accent" className="w-full text-white">
                  Confirmar agendamento
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
