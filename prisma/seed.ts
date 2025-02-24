const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Delete existing data
  await prisma.productCategory.deleteMany()
  await prisma.attendeeGroup.deleteMany()

  // Create attendee groups
  const techTeam = await prisma.attendeeGroup.create({
    data: {
      id: 'tech-team',
      name: 'Technical Team',
      department: 'Technology',
      emails: JSON.stringify(['tech.lead@flexothene.com', 'developer@flexothene.com']),
    },
  })

  const productTeam = await prisma.attendeeGroup.create({
    data: {
      id: 'product-team',
      name: 'Product Team',
      department: 'Product',
      emails: JSON.stringify(['product.manager@flexothene.com', 'product.owner@flexothene.com']),
    },
  })

  const qaTeam = await prisma.attendeeGroup.create({
    data: {
      id: 'qa-team',
      name: 'QA Team',
      department: 'Quality Assurance',
      emails: JSON.stringify(['qa.lead@flexothene.com', 'qa.engineer@flexothene.com']),
    },
  })

  // Create product categories
  await prisma.productCategory.create({
    data: {
      id: 'technical-review',
      name: 'Technical Review',
      requiredGroups: {
        connect: [
          { id: techTeam.id },
          { id: qaTeam.id },
        ],
      },
    },
  })

  await prisma.productCategory.create({
    data: {
      id: 'product-planning',
      name: 'Product Planning',
      requiredGroups: {
        connect: [
          { id: productTeam.id },
          { id: techTeam.id },
        ],
      },
    },
  })

  await prisma.productCategory.create({
    data: {
      id: 'qa-review',
      name: 'QA Review',
      requiredGroups: {
        connect: [
          { id: qaTeam.id },
        ],
      },
    },
  })

  console.log('Database has been seeded')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 