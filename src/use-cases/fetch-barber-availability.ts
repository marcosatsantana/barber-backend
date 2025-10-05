import { BarbersRepository, AppointmentsRepository, BarberExceptionsRepository } from '../repositorys/barbers-repository'
import { PrismaOperatingHoursRepository } from '@/prisma-operating-hours-repository'

function toMinutes(timeHHmm: string): number {
  const [h, m] = timeHHmm.split(':').map(Number)
  return h * 60 + m
}

function fromMinutes(total: number): string {
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export class FetchBarberAvailabilityUseCase {
  private operatingHoursRepository = new PrismaOperatingHoursRepository()
  // Offset de timezone (minutos). Padrão: -180 (UTC-3). Pode ser sobrescrito por env.
  private tzOffsetMinutes = Number(process.env.TZ_OFFSET_MINUTES ?? process.env.APPOINTMENTS_TZ_OFFSET_MINUTES ?? -180)

  constructor(
    private barbersRepository: BarbersRepository,
    private appointmentsRepository: AppointmentsRepository,
    private exceptionsRepository: BarberExceptionsRepository,
  ) { }

  async execute(params: { barberId: string; date: string }) {
    const { barberId, date } = params
    const barber = await this.barbersRepository.findById(barberId)
    if (!barber) return { slots: [] as string[] }

    // "date" representa o dia local; calcular início/fim do dia local em UTC
    const [y, m, d] = date.split('-').map(Number) as [number, number, number]
    const localDayStartUtc = new Date(Date.UTC(y, m - 1, d, 0, 0, 0) - this.tzOffsetMinutes * 60000)
    const localDayEndUtc = new Date(localDayStartUtc.getTime() + 24 * 60 * 60 * 1000 - 1)

    // Descobrir o dia da semana local
    const dayOfWeekLocal = new Date(Date.UTC(y, m - 1, d)).getUTCDay()

    // Buscar horário de funcionamento do dia
    const operatingHours = await this.operatingHoursRepository.findByBarbershopId(barber.barbershop.id)
    const todays = operatingHours.find((h) => h.dayOfWeek === dayOfWeekLocal) || null

    const isClosed = todays?.isClosed
    const openTime = isClosed ? null : (todays?.openTime ?? '08:00')
    const closeTime = isClosed ? null : (todays?.closeTime ?? '18:00')
    if (!openTime || !closeTime) return { slots: [] as string[] }

    // Normalizar aos slots de 30min
    const slotSizeMin = 30
    const openMinRaw = toMinutes(openTime)
    const closeMinRaw = toMinutes(closeTime)
    const openMin = Math.ceil(openMinRaw / slotSizeMin) * slotSizeMin
    const closeMin = Math.floor(closeMinRaw / slotSizeMin) * slotSizeMin
    if (openMin >= closeMin) return { slots: [] as string[] }

    // Buscar compromissos e exceções no range do dia (UTC)
    const [appointments, exceptions] = await Promise.all([
      this.appointmentsRepository.findActivesByBarberBetween({ barberId, start: localDayStartUtc, end: localDayEndUtc }),
      this.exceptionsRepository.findByBarberOnDate({ barberId, date: localDayStartUtc }),
    ])

    // Bloqueios: converter horários UTC dos compromissos para minutos locais
    const blockedIntervals: Array<{ start: number; end: number }> = []
    for (const appt of appointments) {
      const startMin = Math.max(0, Math.floor((appt.startTime.getTime() - localDayStartUtc.getTime()) / 60000))
      const endMin = Math.min(24 * 60, Math.ceil((appt.endTime.getTime() - localDayStartUtc.getTime()) / 60000))
      blockedIntervals.push({ start: startMin, end: endMin })
    }

    // Exceções são HH:mm locais; inserir diretamente
    for (const ex of exceptions) {
      const startMin = toMinutes(ex.startTime)
      const endMin = toMinutes(ex.endTime)
      if (ex.isBlocked) blockedIntervals.push({ start: startMin, end: endMin })
    }

    // Gerar slots
    const slots: string[] = []
    for (let t = openMin; t + slotSizeMin <= closeMin; t += slotSizeMin) {
      const overlaps = blockedIntervals.some((bi) => Math.max(bi.start, t) < Math.min(bi.end, t + slotSizeMin))
      if (!overlaps) slots.push(fromMinutes(t))
    }

    return { slots }
  }
}


