export interface ReviewsRepository {
  create(data: {
    userId: string
    barbershopId: string
    appointmentId?: string
    rating: number
    comment?: string
    serviceId?: string
  }): Promise<{
    id: string
    rating: number
    comment: string | null
    createdAt: Date
    updatedAt: Date
    userId: string
    barbershopId: string
    appointmentId: string | null
    serviceId: string | null
  }>
  
  findByBarbershopId(params: {
    barbershopId: string
    page: number
    perPage: number
  }): Promise<{ 
    items: {
      id: string
      rating: number
      comment: string | null
      createdAt: Date
      user: {
        id: string
        name: string
        avatarUrl: string | null
      }
      service: {
        id: string
        name: string
      } | null
    }[]
    total: number
  }>
  
  findByUserIdAndAppointmentId(params: {
    userId: string
    appointmentId: string
  }): Promise<{
    id: string
    rating: number
    comment: string | null
    createdAt: Date
    updatedAt: Date
    userId: string
    barbershopId: string
    appointmentId: string | null
    serviceId: string | null
  } | null>
}