import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import prismadb from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const salonId = searchParams.get('salonId')

    if (!salonId) {
      return new NextResponse("Salon ID is required", { status: 400 })
    }

    // Verificar se o usuário é dono do salão
    const salon = await prismadb.salon.findFirst({
      where: {
        id: salonId,
        user: {
          clerk_id: userId
        }
      }
    })

    if (!salon) {
      return new NextResponse("Salon not found or access denied", { status: 404 })
    }

    const services = await prismadb.service.findMany({
      where: {
        salon_id: salonId
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    return NextResponse.json({ services })
  } catch (error) {
    console.error('[SERVICES_GET]', error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const {
      salon_id,
      name,
      description,
      base_price,
      duration_min,
      available_days,
      available_start_time,
      available_end_time
    } = body

    if (!salon_id || !name || !description || !base_price || !duration_min || !available_days || !available_start_time || !available_end_time) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Verificar se o usuário é dono do salão
    const salon = await prismadb.salon.findFirst({
      where: {
        id: salon_id,
        user: {
          clerk_id: userId
        }
      }
    })

    if (!salon) {
      return new NextResponse("Salon not found or access denied", { status: 404 })
    }

    const service = await prismadb.service.create({
      data: {
        salon_id,
        name,
        description,
        base_price,
        duration_min,
        available_days,
        available_start_time,
        available_end_time
      }
    })

    return NextResponse.json(service)
  } catch (error) {
    console.error('[SERVICES_POST]', error)
    return new NextResponse("Internal error", { status: 500 })
  }
}