import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import prismadb from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const service = await prismadb.service.findFirst({
      where: {
        id: params.serviceId,
        salon: {
          user: {
            clerk_id: userId
          }
        }
      }
    })

    if (!service) {
      return new NextResponse("Service not found", { status: 404 })
    }

    return NextResponse.json(service)
  } catch (error) {
    console.error('[SERVICE_GET]', error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const {
      name,
      description,
      base_price,
      duration_min,
      available_days,
      available_start_time,
      available_end_time
    } = body

    if (!name || !description || !base_price || !duration_min || !available_days || !available_start_time || !available_end_time) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Verificar se o serviço pertence ao usuário
    const existingService = await prismadb.service.findFirst({
      where: {
        id: params.serviceId,
        salon: {
          user: {
            clerk_id: userId
          }
        }
      }
    })

    if (!existingService) {
      return new NextResponse("Service not found or access denied", { status: 404 })
    }

    const service = await prismadb.service.update({
      where: {
        id: params.serviceId
      },
      data: {
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
    console.error('[SERVICE_PUT]', error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Verificar se o serviço pertence ao usuário
    const existingService = await prismadb.service.findFirst({
      where: {
        id: params.serviceId,
        salon: {
          user: {
            clerk_id: userId
          }
        }
      }
    })

    if (!existingService) {
      return new NextResponse("Service not found or access denied", { status: 404 })
    }

    // Verificar se há agendamentos futuros
    const futureAppointments = await prismadb.appointment.findMany({
      where: {
        service_id: params.serviceId,
        scheduled_at: {
          gte: new Date()
        },
        status: {
          in: ['SCHEDULED']
        }
      }
    })

    if (futureAppointments.length > 0) {
      return new NextResponse("Cannot delete service with future appointments", { status: 400 })
    }

    await prismadb.service.delete({
      where: {
        id: params.serviceId
      }
    })

    return new NextResponse("Service deleted successfully", { status: 200 })
  } catch (error) {
    console.error('[SERVICE_DELETE]', error)
    return new NextResponse("Internal error", { status: 500 })
  }
}