// page.tsx
import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { ServicesManagement } from "./service-management"
import prismadb from "@/lib/prisma"

export default async function ServicesPage() {
  const { userId } = await auth()
  const user = await currentUser()
  
  if (!userId || !user) {
    redirect("/sign-in")
  }

  // Verificar se o usuário é um parceiro
  const dbUser = await prismadb.user.findUnique({
    where: {
      clerk_id: userId,
    },
    include: {
      salon: {
        include: {
          services: {
            orderBy: {
              created_at: 'desc'
            }
          }
        }
      },
    },
  })

  if (!dbUser || dbUser.role !== "PARTNER" || !dbUser.salon) {
    redirect("/partner/register")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Gerenciar Serviços</h1>
          <p className="text-muted-foreground">
            Gerencie os serviços do seu estabelecimento
          </p>
        </div>
        
        <ServicesManagement 
          initialServices={dbUser.salon.services}
          salonId={dbUser.salon.id}
        />
      </div>
    </div>
  )
}