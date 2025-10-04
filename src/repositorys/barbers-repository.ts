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


