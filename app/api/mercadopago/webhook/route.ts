import { NextResponse } from "next/server"
import prismadb from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Verificar se é uma notificação de pagamento
    if (body.type === "payment") {
      const paymentId = body.data.id

      // Aqui você faria uma chamada para a API do Mercado Pago para obter os detalhes do pagamento
      // const paymentDetails = await fetchPaymentDetails(paymentId);

      // Simulando os detalhes do pagamento
      const paymentDetails = {
        status: "approved", // ou "rejected", "pending", etc.
        external_reference: "subscription_123", // Referência para identificar a assinatura
        transaction_amount: 199.0,
      }

      if (paymentDetails.status === "approved") {
        // Atualizar o status do pagamento no banco de dados
        const payment = await prismadb.payment.update({
          where: {
            id: paymentDetails.external_reference,
          },
          data: {
            status: "COMPLETED",
            paid_at: new Date(),
          },
        })

        // Se for um pagamento de assinatura, atualizar a assinatura
        if (payment) {
          await prismadb.subscription.update({
            where: {
              id: payment.subscription_id,
            },
            data: {
              status: "ACTIVE",
            },
          })
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro no webhook do Mercado Pago:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
