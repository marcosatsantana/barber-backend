import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// --- Dados de Exemplo para Geração ---
const barberNames = ['Lucas', 'Matheus', 'Guilherme', 'Rafael', 'Diego', 'Bruno', 'Thiago', 'Vinicius', 'Felipe', 'Leonardo', 'Eduardo', 'Ricardo', 'Daniel', 'Alexandre', 'Júnior', 'Sérgio', 'Marcos', 'Paulo', 'Fernando', 'Rodrigo']
const customerNames = ['Ana', 'Mariana', 'Beatriz', 'Juliana', 'Camila', 'Fernanda', 'Patrícia', 'Amanda', 'Carla', 'Sandra', 'Miguel', 'Arthur', 'Davi', 'Gabriel', 'Pedro', 'Heitor']
const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes']
const reviewComments = [
  { rating: 5, comment: 'Serviço impecável! O melhor da região, com certeza.' },
  { rating: 5, comment: 'Excelente profissional e ambiente muito agradável. Virei cliente fiel!' },
  { rating: 4, comment: 'Gostei bastante do corte, o barbeiro foi muito atencioso. Só achei o preço um pouco alto.' },
  { rating: 4, comment: 'O resultado ficou ótimo, mas o atendimento atrasou um pouco.' },
  { rating: 3, comment: 'O serviço foi razoável. O corte não ficou exatamente como eu pedi.' },
  { rating: 5, comment: 'Atendimento nota 10 e o lugar é muito estiloso.' },
  { rating: 4, comment: 'Bom serviço, profissional competente.' },
  { rating: 5, comment: 'Perfeito! Exatamente o que eu queria. Recomendo muito.' },
]
const barbershopNames = [
  'Barbearia Dom Bigode', 'Navalha & Cia', 'O Rei da Barba', 'Style Cuts Garavelo',
  'Barbearia Imperial', 'Confraria do Corte', 'Studio Men', 'Garavelo Barber Club',
  'The Gentleman', 'Corte Premium'
]
// Coordenadas baseadas na região do Garavelo, Aparecida de Goiânia, GO
const locations = [
  { lat: -16.7605, lon: -49.3350, street: 'Avenida da Igualdade', neighborhood: 'Setor Garavelo' },
  { lat: -16.7589, lon: -49.3321, street: 'Avenida Tropical', neighborhood: 'Jardim Tropical' },
  { lat: -16.7622, lon: -49.3385, street: 'Rua 15-C', neighborhood: 'Setor Garavelo' },
  { lat: -16.7551, lon: -49.3367, street: 'Avenida Liberdade', neighborhood: 'Setor Garavelo' },
  { lat: -16.7640, lon: -49.3300, street: 'Rua 3-B', neighborhood: 'Garavelo Residencial Park' },
  { lat: -16.7598, lon: -49.3399, street: 'Avenida Atlântica', neighborhood: 'Jardim Atlântico' },
  { lat: -16.7615, lon: -49.3362, street: 'Avenida da Paz', neighborhood: 'Setor Garavelo' },
  { lat: -16.7573, lon: -49.3311, street: 'Rua dos Girassóis', neighborhood: 'Jardim dos Girassóis' },
  { lat: -16.7633, lon: -49.3378, street: 'Avenida Rio Verde', neighborhood: 'Vila Rosa' },
  { lat: -16.7566, lon: -49.3344, street: 'Avenida Jataí', neighborhood: 'Setor Garavelo' },
]

// Função auxiliar para pegar um item aleatório de um array
const getRandomItem = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)]

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
  console.log('Creating features and specialties...')
  const [wifi, parking, beer, coffee, games] = await Promise.all([
    prisma.feature.create({ data: { name: 'Wi-Fi Gratuito' } }),
    prisma.feature.create({ data: { name: 'Estacionamento' } }),
    prisma.feature.create({ data: { name: 'Cerveja Artesanal' } }),
    prisma.feature.create({ data: { name: 'Café de Cortesia' } }),
    prisma.feature.create({ data: { name: 'Videogame' } }),
  ])
  const allFeatures = [wifi, parking, beer, coffee, games]

  const [classic, modern, coloring, beard, kids] = await Promise.all([
    prisma.specialty.create({ data: { name: 'Cortes Clássicos' } }),
    prisma.specialty.create({ data: { name: 'Estilos Modernos' } }),
    prisma.specialty.create({ data: { name: 'Coloração' } }),
    prisma.specialty.create({ data: { name: 'Barba Terapia' } }),
    prisma.specialty.create({ data: { name: 'Corte Infantil' } }),
  ])
  const allSpecialties = [classic, modern, coloring, beard, kids]

  // --- 2. Usuários ---
  console.log('Creating users...')
  const ownerUsers = await prisma.user.createManyAndReturn({
    data: Array.from({ length: 10 }).map((_, i) => ({
      name: `Dono ${i + 1}`,
      email: `owner${i + 1}@barber.com`,
      phone: `629999988${i.toString().padStart(2, '0')}`,
      passwordHash,
      role: 'OWNER',
    })),
  })

  const barberUsers = await prisma.user.createManyAndReturn({
    data: barberNames.map((name, i) => ({
      name: `${name} ${getRandomItem(lastNames)}`,
      email: `barber${i + 1}@barber.com`,
      phone: `629888877${i.toString().padStart(2, '0')}`,
      passwordHash,
      role: 'CUSTOMER', // Barbeiros também são usuários com perfil de cliente
    })),
  })

  const customerUsers = await prisma.user.createManyAndReturn({
    data: customerNames.map((name, i) => ({
      name: `${name} ${getRandomItem(lastNames)}`,
      email: `customer${i + 1}@barber.com`,
      phone: `629777766${i.toString().padStart(2, '0')}`,
      passwordHash,
      role: 'CUSTOMER',
    })),
  })

  // --- 3. Barbearias e Entidades Relacionadas ---
  console.log('Creating barbershops and related data...')
  for (let i = 0; i < 10; i++) {
    const location = locations[i]
    const owner = ownerUsers[i]
    const shopName = barbershopNames[i]

    const barbershop = await prisma.barbershop.create({
      data: {
        ownerId: owner.id,
        name: shopName,
        description: `Bem-vindo à ${shopName}, o seu novo espaço de cuidados masculinos no Setor Garavelo.`,
        phone: `62333344${i.toString().padStart(2, '0')}`,
        whatsapp: `629333344${i.toString().padStart(2, '0')}`,
        street: location.street,
        neighborhood: location.neighborhood,
        city: 'Aparecida de Goiânia',
        zipCode: `74930-0${i}0`,
        latitude: location.lat,
        longitude: location.lon,
        coverImageUrl: `https://picsum.photos/seed/shop${i}/800/600`,
        images: {
          create: [
            { url: `https://picsum.photos/seed/shop${i}_a/800/600` },
            { url: `https://picsum.photos/seed/shop${i}_b/800/600` },
          ],
        },
        features: {
          create: [
            { featureId: wifi.id },
            { featureId: coffee.id },
            ...(Math.random() > 0.5 ? [{ featureId: parking.id }] : []),
            ...(Math.random() > 0.7 ? [{ featureId: games.id }] : []),
          ],
        },
        workingHours: {
          createMany: {
            data: [
              { dayOfWeek: 1, openTime: '09:00', closeTime: '19:00' }, // Seg
              { dayOfWeek: 2, openTime: '09:00', closeTime: '19:00' }, // Ter
              { dayOfWeek: 3, openTime: '09:00', closeTime: '19:00' }, // Qua
              { dayOfWeek: 4, openTime: '09:00', closeTime: '20:00' }, // Qui
              { dayOfWeek: 5, openTime: '09:00', closeTime: '20:00' }, // Sex
              { dayOfWeek: 6, openTime: '08:00', closeTime: '17:00' }, // Sáb
              { dayOfWeek: 0, isClosed: true, openTime: '', closeTime: '' }, // Dom
            ],
          },
        },
      },
    })

    // -- 4. Barbeiros (Perfis) --
    const shopBarbers = await Promise.all([
        prisma.barber.create({
            data: {
                userId: barberUsers[i * 2].id, // Pega barbeiros de 2 em 2
                barbershopId: barbershop.id,
                bio: `Especialista em ${classic.name} com mais de 5 anos de experiência.`,
                specialties: { create: [{ specialtyId: classic.id }, { specialtyId: modern.id }] },
            }
        }),
        prisma.barber.create({
            data: {
                userId: barberUsers[i * 2 + 1].id,
                barbershopId: barbershop.id,
                bio: `Foco em ${beard.name} e designs modernos para um visual único.`,
                specialties: { create: [{ specialtyId: beard.id }, { specialtyId: modern.id }, {specialtyId: kids.id }] },
            }
        })
    ]);

    // -- 5. Serviços --
    const services = await Promise.all([
        prisma.service.create({
            data: {
                barbershopId: barbershop.id,
                name: 'Corte Social',
                durationMin: 30, priceCents: 3500, // R$35,00
            }
        }),
        prisma.service.create({
            data: {
                barbershopId: barbershop.id,
                name: 'Corte Degradê',
                description: 'Corte com máquina e finalização detalhada.',
                durationMin: 45, priceCents: 4500, // R$45,00
            }
        }),
        prisma.service.create({
            data: {
                barbershopId: barbershop.id,
                name: 'Barba Simples',
                durationMin: 20, priceCents: 2500, // R$25,00
            }
        }),
        prisma.service.create({
            data: {
                barbershopId: barbershop.id,
                name: 'Combo (Corte + Barba)',
                durationMin: 60, priceCents: 7000, // R$70,00
            }
        }),
        prisma.service.create({
            data: {
                barbershopId: barbershop.id,
                name: 'Hidratação Capilar',
                durationMin: 30, priceCents: 5000, // R$50,00
            }
        }),
    ]);

    // -- 6 & 7. Agendamentos e Avaliações --
    for (let j = 0; j < 5; j++) { // Criar 5 agendamentos por barbearia
      const customer = getRandomItem(customerUsers)
      const barber = getRandomItem(shopBarbers)
      const service = getRandomItem(services)
      const reviewData = getRandomItem(reviewComments)
      const today = new Date()

      const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate() + j + 1, 10 + j, 0, 0); // Horários variados
      const endTime = new Date(startTime.getTime() + service.durationMin * 60000);

      const appointment = await prisma.appointment.create({
        data: {
          customerId: customer.id,
          barberId: barber.id,
          serviceId: service.id,
          startTime,
          endTime,
          status: 'SCHEDULED',
        },
      })

      // Criar uma avaliação para 60% dos agendamentos
      if (Math.random() > 0.4) {
        await prisma.review.create({
          data: {
            userId: customer.id,
            barbershopId: barbershop.id,
            appointmentId: appointment.id,
            rating: reviewData.rating,
            comment: reviewData.comment,
          },
        })
      }
    }
    console.log(`✅ Created ${shopName} and related data.`);
  }
}

main()
  .catch((e) => {
    console.error('❌ An error occurred while seeding the database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    console.log('Database seeded successfully!')
  })