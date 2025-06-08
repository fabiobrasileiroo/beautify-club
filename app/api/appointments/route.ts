import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { userId: clerkUserId } = await auth()
    
    if (!clerkUserId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const { service_id, salon_id, scheduled_at, price_charged } = body

    console.log("📅 Dados do agendamento:", body)

    // Buscar o usuário pelo clerk_id
    const user = await prismadb.user.findUnique({
      where: {
        clerk_id: clerkUserId,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar se o serviço existe e pertence ao salão
    const service = await prismadb.service.findFirst({
      where: {
        id: service_id,
        salon_id: salon_id,
      },
      include: {
        salon: true,
      },
    })

    if (!service) {
      return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 })
    }

    // Verificar se o horário está disponível
    const existingAppointment = await prismadb.appointment.findFirst({
      where: {
        service_id: service_id,
        salon_id: salon_id,
        scheduled_at: new Date(scheduled_at),
        status: {
          not: "CANCELED"
        }
      },
    })

    if (existingAppointment) {
      return NextResponse.json({ error: "Horário não disponível" }, { status: 400 })
    }

    // Criar o agendamento
    const appointment = await prismadb.appointment.create({
      data: {
        user_id: user.id,
        service_id,
        salon_id,
        scheduled_at: new Date(scheduled_at),
        price_charged: Number(price_charged),
        status: "SCHEDULED",
      },
      include: {
        service: {
          select: {
            name: true,
            duration_min: true,
          },
        },
        salon: {
          select: {
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      appointment: {
        id: appointment.id,
        scheduled_at: appointment.scheduled_at,
        service_name: appointment.service.name,
        salon_name: appointment.salon.name,
        price_charged: appointment.price_charged,
        status: appointment.status,
      },
    })
  } catch (error) {
    console.error("Erro ao criar agendamento:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}