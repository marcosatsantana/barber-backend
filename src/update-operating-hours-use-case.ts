import { OperatingHoursRepository } from "./operating-hours-repository"

interface OperatingHour {
  dayOfWeek: number
  openTime: string
  closeTime: string
  isClosed: boolean
}

interface UpdateOperatingHoursUseCaseRequest {
  barbershopId: string
  operatingHours: OperatingHour[]
}

export class UpdateOperatingHoursUseCase {
  constructor(private operatingHoursRepository: OperatingHoursRepository) {}

  async execute({
    barbershopId,
    operatingHours,
  }: UpdateOperatingHoursUseCaseRequest): Promise<void> {
    const dataToUpsert = operatingHours.map((hour) => ({
      ...hour,
      barbershopId,
    }))

    await this.operatingHoursRepository.upsertMany(dataToUpsert)
  }
}