import { OperatingHours, Prisma } from '@prisma/client'

export interface OperatingHoursRepository {
  findByBarbershopId(barbershopId: string): Promise<OperatingHours[]>
  upsertMany(data: Prisma.OperatingHoursUncheckedCreateInput[]): Promise<void>
}