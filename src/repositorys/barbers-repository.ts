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


