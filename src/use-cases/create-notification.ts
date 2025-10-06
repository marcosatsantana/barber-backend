import { NotificationsRepository } from '@/repositorys/notifications-repository'

interface CreateNotificationRequest {
  userId: string
  type: string
  title: string
  message: string
}

export class CreateNotificationUseCase {
  constructor(private notificationsRepository: NotificationsRepository) {}

  async execute({ userId, type, title, message }: CreateNotificationRequest): Promise<void> {
    await this.notificationsRepository.create({
      userId,
      type,
      title,
      message,
    })
  }
}