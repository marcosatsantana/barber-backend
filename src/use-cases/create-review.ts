import { ReviewsRepository } from '@/repositorys/reviews-repository'
import { AppointmentsRepository } from '@/repositorys/barbers-repository'

interface CreateReviewRequest {
  userId: string
  appointmentId: string
  rating: number
  comment?: string
}

export class CreateReviewUseCase {
  constructor(
    private reviewsRepository: ReviewsRepository,
    private appointmentsRepository: AppointmentsRepository
  ) {}

  async execute({ userId, appointmentId, rating, comment }: CreateReviewRequest) {
    // Verify that the appointment exists and belongs to the user
    const appointment = await this.appointmentsRepository.findById(appointmentId)
    
    if (!appointment) {
      throw new Error('Agendamento não encontrado')
    }
    
    if (appointment.customerId !== userId) {
      throw new Error('Você não pode avaliar um agendamento que não é seu')
    }
    
    // Check if the appointment is completed
    if (appointment.status !== 'COMPLETED') {
      throw new Error('Apenas agendamentos concluídos podem ser avaliados')
    }
    
    // Check if a review already exists for this appointment
    const existingReview = await this.reviewsRepository.findByUserIdAndAppointmentId({
      userId,
      appointmentId
    })
    
    if (existingReview) {
      throw new Error('Você já avaliou este agendamento')
    }
    
    // Create the review
    const review = await this.reviewsRepository.create({
      userId,
      barbershopId: appointment.barber.barbershop.id,
      appointmentId,
      rating,
      comment,
      serviceId: appointment.serviceId
    })
    
    return { review }
  }
}