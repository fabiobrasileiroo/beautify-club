import prismadb from "@/lib/prisma"
import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import CreateNewPlanPage from "./create-plans"

export default async function PlansPage() {
  const { userId } = await auth()
  const user = await currentUser()

  if (!userId || !user) {
    redirect("/sign-in")
  }
  // Verificar se o usuário é um administrador
  const dbUser = await prismadb.user.findUnique({
    where: {
      clerk_id: userId,
    },
  })

  if (!dbUser || dbUser.role !== "ADMIN") {
    redirect("/dashboard")
  }
  return (
    <div>
    <CreateNewPlanPage/>
    </div>
  )
}