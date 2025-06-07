// app/api/admin/subscription-plans/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prismadb from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// Schema de validação para a API
const createSubscriptionPlanSchema = z.object({
  name: z.string()
    .min(1, "Nome do plano é obrigatório")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .trim(),
  price: z.number()
    .min(0.01, "Preço deve ser maior que zero")
    .max(99999.99, "Preço muito alto"),
  max_services_per_month: z.number()
    .int("Deve ser um número inteiro")
    .min(1, "Deve ser pelo menos 1")
    .nullable()
    .optional(),
  features: z.string()
    .min(1, "Funcionalidades são obrigatórias")
});

type CreateSubscriptionPlanData = z.infer<typeof createSubscriptionPlanSchema>;

interface ErrorResponse {
  error: string;
  details?: string[];
}

interface SuccessResponse {
  id: string;
  name: string;
  price: number;
  max_services_per_month: number | null;
  features: string;
  created_at: Date;
}

export async function POST(req: NextRequest): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    // Verificar autenticação
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Não autorizado" }, 
        { status: 401 }
      );
    }

    // Verificar se o usuário é admin
    const user = await prismadb.user.findUnique({
      where: { 
        clerk_id: userId 
      },
      select: {
        id: true,
        role: true
      }
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem criar planos." }, 
        { status: 403 }
      );
    }

    // Parse e validação dos dados
    const body = await req.json();
    
    const validationResult = createSubscriptionPlanSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errorDetails = validationResult.error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      );
      
      return NextResponse.json(
        { 
          error: "Dados inválidos", 
          details: errorDetails 
        }, 
        { status: 400 }
      );
    }

    const validatedData: CreateSubscriptionPlanData = validationResult.data;

    // Verificar se já existe um plano com o mesmo nome
    const existingPlan = await prismadb.subscriptionPlan.findFirst({
      where: {
        name: {
          equals: validatedData.name,
          // mode: 'insensitive'
        }
      }
    });

    if (existingPlan) {
      return NextResponse.json(
        { error: "Já existe um plano com este nome" }, 
        { status: 409 }
      );
    }

    // Criar o plano
    const newPlan = await prismadb.subscriptionPlan.create({
      data: {
        name: validatedData.name,
        price: validatedData.price,
        max_services_per_month: validatedData.max_services_per_month || null,
        features: validatedData.features
      }
    });

    return NextResponse.json({
      id: newPlan.id,
      name: newPlan.name,
      price: newPlan.price,
      max_services_per_month: newPlan.max_services_per_month,
      features: newPlan.features,
      created_at: newPlan.created_at
    }, { status: 201 });

  } catch (error) {
    console.error("Erro ao criar plano de assinatura:", error);
    
    return NextResponse.json(
      { 
        error: "Erro interno do servidor",
        details: process.env.NODE_ENV === 'development' 
          ? [error instanceof Error ? error.message : 'Erro desconhecido']
          : undefined
      }, 
      { status: 500 }
    );
  }
}

// GET - Listar todos os planos (opcional)
export async function GET(): Promise<NextResponse> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Não autorizado" }, 
        { status: 401 }
      );
    }

    // Verificar se o usuário é admin
    const user = await prismadb.user.findUnique({
      where: { clerk_id: userId },
      select: { role: true }
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado" }, 
        { status: 403 }
      );
    }

    const plans = await prismadb.subscriptionPlan.findMany({
      orderBy: {
        created_at: 'desc'
      },
      select: {
        id: true,
        name: true,
        price: true,
        max_services_per_month: true,
        features: true,
        created_at: true,
        updated_at: true,
        _count: {
          select: {
            subscriptions: true
          }
        }
      }
    });

    return NextResponse.json(plans);

  } catch (error) {
    console.error("Erro ao buscar planos:", error);
    
    return NextResponse.json(
      { error: "Erro interno do servidor" }, 
      { status: 500 }
    );
  }
}