import { Barber, Barbershop } from '@prisma/client'

export type Coordinates = {
  latitude: number
  longitude: number
}

export type NearbySearchParams = Coordinates & {
  radiusInKm?: number
}

export interface BarberWithShop extends Barber {
  barbershop: Barbershop
}

export interface BarbersRepository {
  create(data: { userId: string; barbershopId: string }): Promise<Barber>
  findById(id: string): Promise<BarberWithShop | null>
  findManyNearby(params: NearbySearchParams): Promise<BarberWithShop[]>
}

export interface AppointmentsRepository {
  create(data: {
    customerId: string
    barberId: string
    serviceId: string
    startTime: Date
    endTime: Date
  }): Promise<{
    id: string
    startTime: Date
    endTime: Date
    status: string
    customerId: string
    barberId: string
    serviceId: string
    createdAt: Date
  }>

  findActivesByBarberBetween(params: {
    barberId: string
    start: Date
    end: Date
  }): Promise<{
    id: string
    startTime: Date
    endTime: Date
    status: string
  }[]>

  // Listagem simples (sem paginação) - mantida por retrocompatibilidade
  findByBarberId(barberId: string): Promise<{
    id: string
    startTime: Date
    endTime: Date
    status: string
    customerId: string
    barberId: string
    serviceId: string
    createdAt: Date
    customer: {
      id: string
      name: string
      email: string
      phone?: string
    }
    service: {
      id: string
      name: string
      durationMin: number
      priceCents: number
    }
  }[]>

  // Listagem simples (sem paginação) - mantida por retrocompatibilidade
  findByBarbershopOwnerId(ownerId: string): Promise<{
    id: string
    startTime: Date
    endTime: Date
    status: string
    customerId: string
    barberId: string
    serviceId: string
    createdAt: Date
    customer: {
      id: string
      name: string
      email: string
      phone?: string
    }
    service: {
      id: string
      name: string
      durationMin: number
      priceCents: number
    }
    barber: {
      id: string
      user: {
        id: string
        name: string
        email: string
      }
      barbershop: {
        id: string
        name: string
      }
    }
  }[]>

  // Find appointment by ID
  findById(appointmentId: string): Promise<{
    id: string
    startTime: Date
    endTime: Date
    status: string
    customerId: string
    barberId: string
    serviceId: string
    createdAt: Date
    customer: {
      id: string
      name: string
      email: string
      phone?: string
    }
    service: {
      id: string
      name: string
      durationMin: number
      priceCents: number
    }
    barber: {
      id: string
      user: {
        id: string
        name: string
        email: string
      }
      barbershop: {
        id: string
        name: string
      }
    }
  } | null>

  // Paginada + filtros
  findByBarberPaged(params: {
    barberId: string
    page: number
    perPage: number
    status?: 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED'
    dateFrom?: Date
    dateTo?: Date
  }): Promise<{ items: {
    id: string
    startTime: Date
    endTime: Date
    status: string
    customerId: string
    barberId: string
    serviceId: string
    createdAt: Date
    customer: {
      id: string
      name: string
      email: string
      phone?: string
    }
    service: {
      id: string
      name: string
      durationMin: number
      priceCents: number
    }
  }[]; total: number }>

  findByOwnerPaged(params: {
    ownerId: string
    page: number
    perPage: number
    status?: 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED'
    dateFrom?: Date
    dateTo?: Date
  }): Promise<{ items: {
    id: string
    startTime: Date
    endTime: Date
    status: string
    customerId: string
    barberId: string
    serviceId: string
    createdAt: Date
    customer: {
      id: string
      name: string
      email: string
      phone?: string
    }
    service: {
      id: string
      name: string
      durationMin: number
      priceCents: number
    }
    barber: {
      id: string
      user: {
        id: string
        name: string
        email: string
      }
      barbershop: {
        id: string
        name: string
      }
    }
  }[]; total: number }>

  // Add new method for customer appointments
  findByCustomerPaged(params: {
    customerId: string
    page: number
    perPage: number
    status?: 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
    dateFrom?: Date
    dateTo?: Date
  }): Promise<{ items: {
    id: string
    startTime: Date
    endTime: Date
    status: string
    customerId: string
    barberId: string
    serviceId: string
    createdAt: Date
    customer: {
      id: string
      name: string
      email: string
      phone?: string
    }
    service: {
      id: string
      name: string
      durationMin: number
      priceCents: number
    }
    barber: {
      id: string
      user: {
        id: string
        name: string
        email: string
      }
      barbershop: {
        id: string
        name: string
      }
    }
    // Add review property to check if appointment has been reviewed
    review?: {
      id: string
    } | null
  }[]; total: number }>

  // Sumário mensal para destacar dias no calendário
  getBarberMonthlySummary(params: { barberId: string; monthStart: Date; monthEnd: Date }): Promise<{ date: string; count: number }[]>
  getOwnerMonthlySummary(params: { ownerId: string; monthStart: Date; monthEnd: Date }): Promise<{ date: string; count: number }[]>

  updateStatus(appointmentId: string, status: string): Promise<{
    id: string
    startTime: Date
    endTime: Date
    status: string
    customerId: string
    barberId: string
    serviceId: string
    createdAt: Date
  }>
}

export interface BarberExceptionsRepository {
  findByBarberOnDate(params: {
    barberId: string
    date: Date
  }): Promise<{
    id: string
    date: Date
    startTime: string
    endTime: string
    isBlocked: boolean
  }[]>
}