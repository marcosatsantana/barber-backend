import { NotificationsRepository } from '@/repositorys/notifications-repository'

interface ListNotificationsRequest {
  userId: string
}

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: Date
}

interface ListNotificationsResponse {
  notifications: Notification[]
}

export class ListNotificationsUseCase {
  constructor(private notificationsRepository: NotificationsRepository) {}

  async execute({ userId }: ListNotificationsRequest): Promise<ListNotificationsResponse> {
    const notifications = await this.notificationsRepository.findByUserId(userId)

    return {
      notifications: notifications.map(notification => ({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        read: notification.read,
        createdAt: notification.createdAt,
      })),
    }
  }
}