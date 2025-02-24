import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class DatabaseService {
  private static instance: DatabaseService
  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  // Attendee Groups
  async getAttendeeGroups() {
    return prisma.attendeeGroup.findMany({
      include: {
        categories: true,
      },
    })
  }

  async createAttendeeGroup(data: {
    id: string
    name: string
    department: string
    emails: string[]
  }) {
    return prisma.attendeeGroup.create({
      data: {
        ...data,
        emails: JSON.stringify(data.emails),
      },
    })
  }

  async updateAttendeeGroup(
    id: string,
    data: {
      name?: string
      department?: string
      emails?: string[]
    }
  ) {
    return prisma.attendeeGroup.update({
      where: { id },
      data: {
        ...data,
        emails: data.emails ? JSON.stringify(data.emails) : undefined,
      },
    })
  }

  async deleteAttendeeGroup(id: string) {
    return prisma.attendeeGroup.delete({
      where: { id },
    })
  }

  // Product Categories
  async getProductCategories() {
    return prisma.productCategory.findMany({
      include: {
        requiredGroups: true,
      },
    })
  }

  async createProductCategory(data: {
    id: string
    name: string
    requiredGroupIds: string[]
  }) {
    return prisma.productCategory.create({
      data: {
        id: data.id,
        name: data.name,
        requiredGroups: {
          connect: data.requiredGroupIds.map((id) => ({ id })),
        },
      },
      include: {
        requiredGroups: true,
      },
    })
  }

  async updateProductCategory(
    id: string,
    data: {
      name?: string
      requiredGroupIds?: string[]
    }
  ) {
    return prisma.productCategory.update({
      where: { id },
      data: {
        name: data.name,
        requiredGroups: data.requiredGroupIds
          ? {
              set: data.requiredGroupIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        requiredGroups: true,
      },
    })
  }

  async deleteProductCategory(id: string) {
    return prisma.productCategory.delete({
      where: { id },
    })
  }
} 