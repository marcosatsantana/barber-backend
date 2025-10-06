import { FastifyInstance } from 'fastify'
import { listNotificationsController } from '@/http/controllers/notifications/list-notifications.controller'
import { markNotificationAsReadController } from '@/http/controllers/notifications/mark-notification-as-read.controller'
import { markAllNotificationsAsReadController } from '@/http/controllers/notifications/mark-all-notifications-as-read.controller'

export async function notificationsRoutes(app: FastifyInstance) {
  app.get('/notifications', listNotificationsController)
  app.patch('/notifications/:id/read', markNotificationAsReadController)
  app.patch('/notifications/read-all', markAllNotificationsAsReadController)
}