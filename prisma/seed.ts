import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Cleaning database...')
  // Limpa o banco na ordem correta para evitar erros de chave estrangeira
  await prisma.review.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.operatingHours.deleteMany()
  await prisma.media.deleteMany()
  await prisma.barbershopFeature.deleteMany()
  await prisma.barberSpecialty.deleteMany()
  await prisma.feature.deleteMany()
  await prisma.specialty.deleteMany()
  await prisma.service.deleteMany()
  await prisma.barber.deleteMany()
  await prisma.barbershop.deleteMany()
  await prisma.user.deleteMany()

  console.log('🌱 Seeding database...')

  const passwordHash = await bcrypt.hash('123456', 10)

  // --- 1. Dados Independentes ---
  const [wifi, parking, beer] = await Promise.all([
    prisma.feature.create({ data: { name: 'Wi-Fi Gratuito' } }),
    prisma.feature.create({ data: { name: 'Estacionamento' } }),
    prisma.feature.create({ data: { name: 'Cerveja Artesanal' } }),
  ])

  const [classic, modern, coloring] = await Promise.all([
    prisma.specialty.create({ data: { name: 'Cortes Clássicos' } }),
    prisma.specialty.create({ data: { name: 'Estilos Modernos' } }),
    prisma.specialty.create({ data: { name: 'Coloração' } }),
  ])

  // --- 2. Usuários ---
  const [ownerUser, barberUser1, customerUser1] = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Carlos Dono',
        email: 'owner@barber.com',
        phone: '11988887777',
        passwordHash,
        role: 'OWNER',
        avatarUrl: 'https://i.pravatar.cc/150?u=owner',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Roberto Barbeiro',
        email: 'barber@barber.com',
        phone: '11977776666',
        passwordHash,
        role: 'CUSTOMER', // O papel dele é cliente, mas ele tem um perfil de barbeiro
        avatarUrl: 'https://i.pravatar.cc/150?u=barber',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Ana Cliente',
        email: 'customer@barber.com',
        phone: '11966665555',
        passwordHash,
        role: 'CUSTOMER',
        avatarUrl: 'https://i.pravatar.cc/150?u=customer',
      },
    }),
  ])

  // --- 3. Barbearias ---
  const barbershop = await prisma.barbershop.create({
    data: {
      ownerId: ownerUser.id,
      name: 'Barbearia Navalha de Ouro',
      description: 'A melhor barbearia da cidade, com tradição e modernidade.',
      phone: '1122223333',
      whatsapp: '11922223333',
      street: 'Rua Principal',
      neighborhood: 'Centro',
      city: 'São Paulo',
      zipCode: '01001-000',
      latitude: -23.5505,
      longitude: -46.6333,
      coverImageUrl: 'https://picsum.photos/seed/barbershop1/800/600',
      images: {
        create: [
          { url: 'https://picsum.photos/seed/barbershop2/800/600' },
          { url: 'https://picsum.photos/seed/barbershop3/800/600' },
        ],
      },
      features: {
        create: [
          { featureId: wifi.id },
          { featureId: parking.id },
          { featureId: beer.id },
        ],
      },
      workingHours: {
        createMany: {
          data: [
            { dayOfWeek: 1, openTime: '09:00', closeTime: '19:00' }, // Segunda
            { dayOfWeek: 2, openTime: '09:00', closeTime: '19:00' }, // Terça
            { dayOfWeek: 3, openTime: '09:00', closeTime: '19:00' }, // Quarta
            { dayOfWeek: 4, openTime: '09:00', closeTime: '20:00' }, // Quinta
            { dayOfWeek: 5, openTime: '09:00', closeTime: '20:00' }, // Sexta
            { dayOfWeek: 6, openTime: '08:00', closeTime: '17:00' }, // Sábado
            { dayOfWeek: 0, isClosed: true, openTime: '', closeTime: '' }, // Domingo
          ],
        },
      },
    },
  })

  // --- 4. Barbeiros (Perfis) ---
  const barberProfile = await prisma.barber.create({
    data: {
      userId: barberUser1.id,
      barbershopId: barbershop.id,
      bio: '10 anos de experiência em cortes clássicos e modernos.',
      specialties: {
        create: [
          { specialtyId: classic.id },
          { specialtyId: modern.id },
        ],
      },
    },
  })

  // --- 5. Serviços ---
  const [serviceCut, serviceShave] = await Promise.all([
    prisma.service.create({
      data: {
        barbershopId: barbershop.id,
        name: 'Corte de Cabelo',
        description: 'Corte com tesoura e máquina, finalização com pomada.',
        durationMin: 45,
        priceCents: 5000, // R$ 50,00
      },
    }),
    prisma.service.create({
      data: {
        barbershopId: barbershop.id,
        name: 'Barba Terapia',
        description: 'Barba com toalha quente, navalha e massagem facial.',
        durationMin: 30,
        priceCents: 4000, // R$ 40,00
      },
    }),
  ])

  // --- 6. Agendamentos ---
  const today = new Date()
  const appointment = await prisma.appointment.create({
    data: {
      customerId: customerUser1.id,
      barberId: barberProfile.id,
      serviceId: serviceCut.id,
      startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 14, 0, 0), // Daqui a 2 dias, às 14h
      endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 14, 45, 0),
      status: 'SCHEDULED',
    },
  })

  // --- 7. Avaliações (vinculadas a um agendamento) ---
  await prisma.review.create({
    data: {
      userId: customerUser1.id,
      barbershopId: barbershop.id,
      appointmentId: appointment.id, // Avaliação verificada
      rating: 5,
      comment: 'O Roberto é um excelente profissional! Recomendo muito.',
    },
  })

  console.log('✅ Seed completed successfully.')
}

main()
  .catch((e) => {
    console.error('❌ An error occurred while seeding the database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })