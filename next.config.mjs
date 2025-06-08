/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false, // Se quiser otimização automática (opcional)
    domains: ['i.ibb.co'], // <- ADICIONE ESTE DOMÍNIO
  },
}

export default nextConfig
