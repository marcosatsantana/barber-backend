import { Notification } from '@prisma/client'

export interface NotificationsRepository {
  create(data: {
    userId: string
    type: string
    title: string
    message: string
  }): Promise<Notification>

  findByUserId(userId: string): Promise<Notification[]>

  markAsRead(id: string): Promise<Notification>

  markAllAsRead(userId: string): Promise<void>
}