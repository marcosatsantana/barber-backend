import { prisma } from '@/lib/prisma'
import { NotificationsRepository } from '../notifications-repository'
import { Notification } from '@prisma/client'

export class PrismaNotificationsRepository implements NotificationsRepository {
  async create(data: {
    userId: string
    type: string
    title: string
    message: string
  }): Promise<Notification> {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
      },
    })
  }

  async findByUserId(userId: string): Promise<Notification[]> {
    return prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  async markAsRead(id: string): Promise<Notification> {
    return prisma.notification.update({
      where: {
        id,
      },
      data: {
        read: true,
      },
    })
  }

  async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
      },
    })
  }
}