export interface Plan {
  id: string
  name: string
  price: number
  max_services_per_month: number | null
  features: string
  created_at: Date
  updated_at: Date
}

export interface ActiveSubscription {
  id: string
  plan_id: string
  start_date: Date
  end_date: Date
  status: SubscriptionStatus
  plan: Plan
  created_at: Date
  updated_at: Date
}

export enum SubscriptionStatus {
  ACTIVE = "ACTIVE",
  CANCELED = "CANCELED",
  EXPIRED = "EXPIRED"
}

export interface SubscriptionCancelRequest {
  subscriptionId: string
}

export interface SubscriptionCancelResponse {
  message: string
  subscription: {
    id: string
    status: string
    end_date: Date
    plan_name: string
  }
}

export interface CheckoutRequest {
  planId: string
}

export interface CheckoutResponse {
  url: string
  sessionId: string
}

// Para usar no componente
export interface PlansClientProps {
  plans: Plan[]
  activeSubscription?: ActiveSubscription
  isSignedIn: boolean
}