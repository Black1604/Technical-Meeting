export interface AttendeeGroup {
  id: string
  name: string
  emails: string[]
  department: string
}

export interface ProductCategory {
  id: string
  name: string
  requiredGroups: string[]
}

export const attendeeGroups: AttendeeGroup[] = [
  {
    id: 'tech-team',
    name: 'Technical Team',
    emails: ['tech.lead@flexothene.com', 'developer@flexothene.com'],
    department: 'Technology',
  },
  {
    id: 'product-team',
    name: 'Product Team',
    emails: ['product.manager@flexothene.com', 'product.owner@flexothene.com'],
    department: 'Product',
  },
  {
    id: 'qa-team',
    name: 'QA Team',
    emails: ['qa.lead@flexothene.com', 'qa.engineer@flexothene.com'],
    department: 'Quality Assurance',
  },
]

export const productCategories: ProductCategory[] = [
  {
    id: 'technical-review',
    name: 'Technical Review',
    requiredGroups: ['tech-team', 'qa-team'],
  },
  {
    id: 'product-planning',
    name: 'Product Planning',
    requiredGroups: ['product-team', 'tech-team'],
  },
  {
    id: 'qa-review',
    name: 'QA Review',
    requiredGroups: ['qa-team'],
  },
]

export function getRequiredAttendeesForCategory(categoryId: string): string[] {
  const category = productCategories.find((c) => c.id === categoryId)
  if (!category) return []

  const emails = new Set<string>()
  category.requiredGroups.forEach((groupId) => {
    const group = attendeeGroups.find((g) => g.id === groupId)
    if (group) {
      group.emails.forEach((email) => emails.add(email))
    }
  })

  return Array.from(emails)
} 