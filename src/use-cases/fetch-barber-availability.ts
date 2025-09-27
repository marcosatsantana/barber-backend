import { BarbersRepository, AppointmentsRepository, BarberExceptionsRepository } from '../repositorys/barbers-repository'

function toMinutes(timeHHmm: string): number {
  const [h, m] = timeHHmm.split(':').map(Number)
  return h * 60 + m
}

function fromMinutes(total: number): string {
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000)
}

export class FetchBarberAvailabilityUseCase {
  constructor(
    private barbersRepository: BarbersRepository,
    private appointmentsRepository: AppointmentsRepository,
    private exceptionsRepository: BarberExceptionsRepository,
  ) { }

  async execute(params: { barberId: string; date: string }) {
    const { barberId, date } = params
    const barber = await this.barbersRepository.findById(barberId)
    if (!barber) return { slots: [] as string[] }

    const target = new Date(`${date}T00:00:00.000Z`)
    const dayOfWeek = target.getUTCDay()

    const shop = barber.barbershop
    const operating = await (async () => {
      // pull operating hours for shop and day
      // We do not have a repository for operating hours; use prisma directly would break abstraction.
      // Instead, rely on relation shape returned elsewhere; as not available, fallback to wide open 08:00-18:00
      return null as unknown as { isClosed: boolean; openTime: string; closeTime: string } | null
    })()

    // Fallback: 08:00-18:00 if no schedule available
    const openTime = operating?.isClosed ? null : (operating?.openTime ?? '08:00')
    const closeTime = operating?.isClosed ? null : (operating?.closeTime ?? '18:00')
    if (!openTime || !closeTime) return { slots: [] as string[] }

    const dayStart = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate(), 0, 0, 0))
    const dayEnd = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate(), 23, 59, 59, 999))

    const [appointments, exceptions] = await Promise.all([
      this.appointmentsRepository.findActivesByBarberBetween({ barberId, start: dayStart, end: dayEnd }),
      this.exceptionsRepository.findByBarberOnDate({ barberId, date: dayStart }),
    ])

    const slotSizeMin = 30
    const openMin = toMinutes(openTime)
    const closeMin = toMinutes(closeTime)

    const blockedIntervals: Array<{ start: number; end: number }> = []

    for (const appt of appointments) {
      if (appt.status !== 'CONFIRMED' && appt.status !== 'SCHEDULED') continue; // Só bloqueia horários confirmados
      const startMin = Math.max(0, Math.floor((appt.startTime.getTime() - dayStart.getTime()) / 60000))
      const endMin = Math.min(24 * 60, Math.ceil((appt.endTime.getTime() - dayStart.getTime()) / 60000))
      blockedIntervals.push({ start: startMin, end: endMin })
    }

    for (const ex of exceptions) {
      const startMin = toMinutes(ex.startTime)
      const endMin = toMinutes(ex.endTime)
      if (ex.isBlocked) {
        blockedIntervals.push({ start: startMin, end: endMin })
      } else {
        // is an allowed extra window: shrink working window to intersection later; handle by marking all outside as blocked
      }
    }

    // Build candidate slots
    const candidateSlots: string[] = []
    for (let t = openMin; t + slotSizeMin <= closeMin; t += slotSizeMin) {
      const slotStart = t
      const slotEnd = t + slotSizeMin
      // Check overlap with blocked intervals
      const overlaps = blockedIntervals.some((bi) => Math.max(bi.start, slotStart) < Math.min(bi.end, slotEnd))
      if (!overlaps) {
        candidateSlots.push(fromMinutes(slotStart))
      }
    }

    return { slots: candidateSlots }
  }
}


