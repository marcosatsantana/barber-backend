import { PrismaReviewsRepository } from '@/repositorys/prisma/prisma-reviews-repository'
import { PrismaAppointmentsRepository } from '@/repositorys/prisma/prisma-appointments-repository'
import { CreateReviewUseCase } from '@/use-cases/create-review'

export function makeCreateReviewUseCase() {
  const reviewsRepository = new PrismaReviewsRepository()
  const appointmentsRepository = new PrismaAppointmentsRepository()
  const useCase = new CreateReviewUseCase(reviewsRepository, appointmentsRepository)

  return useCase
}