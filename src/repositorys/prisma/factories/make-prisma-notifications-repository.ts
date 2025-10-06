import { PrismaNotificationsRepository } from '../prisma-notifications-repository'

export function makePrismaNotificationsRepository() {
  return new PrismaNotificationsRepository()
}