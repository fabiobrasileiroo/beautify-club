import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

// Definir rotas públicas - incluindo a página de salões
const isPublicRoute = createRouteMatcher(["/", "/api/webhook", "/api/mercadopago/webhook", "/salons", "/salons/(.*)"])

export default clerkMiddleware(async (auth, req) => {
  // Se NÃO for rota pública, exige autenticação
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Ignora arquivos estáticos e _next
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Aplica também em APIs /trpc
    "/(api|trpc)(.*)",
  ],
}
