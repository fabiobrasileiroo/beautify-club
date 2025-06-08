import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Star } from "lucide-react"

import prismadb from "@/lib/prisma"
import { GeolocationSearch } from "@/components/geolocation-search"

export default async function SalonsPage() {
  // Buscar salões aprovados do banco de dados
  const salons = await prismadb.salon.findMany({
    where: {
      status: "APPROVED",
    },
    include: {
      services: true,
    },
  })
  console.log("🚀 ~ SalonsPage ~ salons:", salons)

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Salões e Barbearias</h1>
          <p className="text-muted-foreground">Encontre os melhores estabelecimentos próximos a você</p>
        </div>
      </div>

      <GeolocationSearch />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {salons.length > 0 ? (
          salons.map((salon) => (
            <Card key={salon.id} className="overflow-hidden">
              <div className="h-48 bg-secondary relative">
                <Image
                  src={salon.image_url ?? "/placeholder.svg?height=400&width=600"}
                  alt={salon.name}
                  fill
                  className="object-cover"
                />

              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">{salon.name}</h3>
                <div className="flex items-center mb-2">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" />
                  <Star className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" />
                  <Star className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" />
                  <Star className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" />
                  <Star className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" />
                  <span className="text-sm text-muted-foreground ml-1">5.0</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{salon.address}</span>
                </div>
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Serviços disponíveis:</h4>
                  <div className="flex flex-wrap gap-2">
                    {salon.services.slice(0, 3).map((service) => (
                      <span key={service.id} className="bg-secondary text-xs px-2 py-1 rounded-full">
                        {service.name}
                      </span>
                    ))}
                    {salon.services.length > 3 && (
                      <span className="bg-secondary text-xs px-2 py-1 rounded-full">
                        +{salon.services.length - 3} mais
                      </span>
                    )}
                  </div>
                </div>
                <Link href={`/salons/${salon.id}`}>
                  <Button variant="accent" className="w-full text-white">
                    Ver detalhes
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <h3 className="text-xl font-medium mb-2">Nenhum salão encontrado</h3>
            <p className="text-muted-foreground mb-6">Não encontramos salões com os filtros selecionados.</p>
            <Button variant="outline">Limpar filtros</Button>
          </div>
        )}
      </div>
    </div>
  )
}
