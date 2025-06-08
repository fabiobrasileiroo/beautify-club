import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import prismadb from "@/lib/prisma"

export async function PATCH(request: Request, { params }: { params: { appointmentId: string } }) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await prismadb.user.findFirst({
      where: { clerk_id: userId },
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Verificar se o agendamento pertence ao usuário
    const appointment = await prismadb.appointment.findFirst({
      where: {
        id: params.appointmentId,
        user_id: user.id,
      },
    })

    if (!appointment) {
      return new NextResponse("Appointment not found", { status: 404 })
    }

    // Cancelar o agendamento
    const updatedAppointment = await prismadb.appointment.update({
      where: { id: params.appointmentId },
      data: { status: "CANCELED" },
    })

    return NextResponse.json(updatedAppointment)
  } catch (error) {
    console.error("[APPOINTMENT_CANCEL]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
