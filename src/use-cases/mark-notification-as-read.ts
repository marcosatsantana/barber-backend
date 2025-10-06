import { NotificationsRepository } from '@/repositorys/notifications-repository'

interface MarkNotificationAsReadRequest {
  notificationId: string
}

export class MarkNotificationAsReadUseCase {
  constructor(private notificationsRepository: NotificationsRepository) {}

  async execute({ notificationId }: MarkNotificationAsReadRequest): Promise<void> {
    await this.notificationsRepository.markAsRead(notificationId)
  }
}