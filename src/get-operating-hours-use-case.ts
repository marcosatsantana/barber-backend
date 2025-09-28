import { OperatingHours } from '@prisma/client'
import { OperatingHoursRepository } from './operating-hours-repository'

interface GetOperatingHoursUseCaseRequest {
  barbershopId: string
}

interface GetOperatingHoursUseCaseResponse {
  operatingHours: OperatingHours[]
}

export class GetOperatingHoursUseCase {
  constructor(private operatingHoursRepository: OperatingHoursRepository) {}

  async execute({
    barbershopId,
  }: GetOperatingHoursUseCaseRequest): Promise<GetOperatingHoursUseCaseResponse> {
    const operatingHours =
      await this.operatingHoursRepository.findByBarbershopId(barbershopId)

    return { operatingHours }
  }
}