import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

// Definir rotas públicas - incluindo a página de salões
const isPublicRoute = createRouteMatcher([
  "/",
  "/api/webhook",
  "/api/stripe/checkout",
  "/api/stripe/webhook",
  // "/api/user/check-role", // ✅ Tornar API pública temporariamente
  // "/partner", 
  // "/partner/register", // ✅ Adicionar explicitamente
  // "/partner/(.*)", 
  "/salons", 
  "/salons/(.*)"
])

export default clerkMiddleware(async (auth, req) => {
  // Debug - adicionar log para ver se a rota está sendo identificada como pública
  console.log("🔍 Middleware - URL:", req.url)
  console.log("🔍 É rota pública?", isPublicRoute(req))
  
  // Se NÃO for rota pública, exige autenticação
  if (!isPublicRoute(req)) {
    console.log("🔒 Protegendo rota:", req.url)
    await auth.protect()
  } else {
    console.log("🔓 Rota pública liberada:", req.url)
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