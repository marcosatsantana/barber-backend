import { NotificationsRepository } from '@/repositorys/notifications-repository'

interface MarkAllNotificationsAsReadRequest {
  userId: string
}

export class MarkAllNotificationsAsReadUseCase {
  constructor(private notificationsRepository: NotificationsRepository) {}

  async execute({ userId }: MarkAllNotificationsAsReadRequest): Promise<void> {
    await this.notificationsRepository.markAllAsRead(userId)
  }
}