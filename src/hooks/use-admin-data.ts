import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/components/providers/toast-provider'
import type { AttendeeGroup, ProductCategory } from '@prisma/client'

type GroupWithEmails = Omit<AttendeeGroup, 'emails'> & { emails: string[] }
type CategoryWithGroups = ProductCategory & { requiredGroups: AttendeeGroup[] }

interface AdminData {
  groups: GroupWithEmails[]
  categories: CategoryWithGroups[]
  isLoading: boolean
  refetch: () => Promise<void>
  createGroup: (data: {
    id: string
    name: string
    department: string
    emails: string[]
  }) => Promise<void>
  updateGroup: (
    id: string,
    data: {
      name?: string
      department?: string
      emails?: string[]
    }
  ) => Promise<void>
  deleteGroup: (id: string) => Promise<void>
  createCategory: (data: {
    id: string
    name: string
    requiredGroupIds: string[]
  }) => Promise<void>
  updateCategory: (
    id: string,
    data: {
      name?: string
      requiredGroupIds?: string[]
    }
  ) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
}

export function useAdminData(): AdminData {
  const [groups, setGroups] = useState<GroupWithEmails[]>([])
  const [categories, setCategories] = useState<CategoryWithGroups[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { showToast } = useToast()

  const fetchData = useCallback(async () => {
    try {
      const [groupsRes, categoriesRes] = await Promise.all([
        fetch('/api/admin/groups'),
        fetch('/api/admin/categories'),
      ])

      if (!groupsRes.ok || !categoriesRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const [groupsData, categoriesData] = await Promise.all([
        groupsRes.json(),
        categoriesRes.json(),
      ])

      setGroups(groupsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Error fetching admin data:', error)
      showToast('Failed to fetch admin data', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const createGroup = async (data: {
    id: string
    name: string
    department: string
    emails: string[]
  }) => {
    // Optimistically add the new group
    const newGroup: GroupWithEmails = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setGroups((prev) => [...prev, newGroup])

    try {
      const res = await fetch('/api/admin/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Failed to create group')

      const savedGroup = await res.json()
      setGroups((prev) => prev.map((g) => (g.id === data.id ? savedGroup : g)))
      showToast('Group created successfully', 'success')
    } catch (error) {
      // Revert optimistic update on error
      setGroups((prev) => prev.filter((g) => g.id !== data.id))
      console.error('Error creating group:', error)
      showToast('Failed to create group', 'error')
      throw error
    }
  }

  const updateGroup = async (
    id: string,
    data: {
      name?: string
      department?: string
      emails?: string[]
    }
  ) => {
    // Optimistically update the group
    const oldGroup = groups.find((g) => g.id === id)
    if (!oldGroup) return

    const updatedGroup: GroupWithEmails = {
      ...oldGroup,
      ...data,
      updatedAt: new Date(),
    }
    setGroups((prev) => prev.map((g) => (g.id === id ? updatedGroup : g)))

    try {
      const res = await fetch('/api/admin/groups', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      })

      if (!res.ok) throw new Error('Failed to update group')

      const savedGroup = await res.json()
      setGroups((prev) => prev.map((g) => (g.id === id ? savedGroup : g)))
      showToast('Group updated successfully', 'success')
    } catch (error) {
      // Revert optimistic update on error
      setGroups((prev) => prev.map((g) => (g.id === id ? oldGroup : g)))
      console.error('Error updating group:', error)
      showToast('Failed to update group', 'error')
      throw error
    }
  }

  const deleteGroup = async (id: string) => {
    // Store the group before deletion for potential recovery
    const deletedGroup = groups.find((g) => g.id === id)
    if (!deletedGroup) return

    // Optimistically remove the group
    setGroups((prev) => prev.filter((g) => g.id !== id))

    try {
      const res = await fetch('/api/admin/groups', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (!res.ok) throw new Error('Failed to delete group')

      showToast('Group deleted successfully', 'success')
    } catch (error) {
      // Restore the group on error
      setGroups((prev) => [...prev, deletedGroup])
      console.error('Error deleting group:', error)
      showToast('Failed to delete group', 'error')
      throw error
    }
  }

  const createCategory = async (data: {
    id: string
    name: string
    requiredGroupIds: string[]
  }) => {
    // Find required groups for optimistic update
    const requiredGroups = groups.filter((g) => data.requiredGroupIds.includes(g.id))
    
    // Optimistically add the new category
    const newCategory: CategoryWithGroups = {
      id: data.id,
      name: data.name,
      requiredGroups,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setCategories((prev) => [...prev, newCategory])

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Failed to create category')

      const savedCategory = await res.json()
      setCategories((prev) =>
        prev.map((c) => (c.id === data.id ? savedCategory : c))
      )
      showToast('Category created successfully', 'success')
    } catch (error) {
      // Revert optimistic update on error
      setCategories((prev) => prev.filter((c) => c.id !== data.id))
      console.error('Error creating category:', error)
      showToast('Failed to create category', 'error')
      throw error
    }
  }

  const updateCategory = async (
    id: string,
    data: {
      name?: string
      requiredGroupIds?: string[]
    }
  ) => {
    // Store the old category for potential recovery
    const oldCategory = categories.find((c) => c.id === id)
    if (!oldCategory) return

    // Find required groups for optimistic update
    const requiredGroups = data.requiredGroupIds
      ? groups.filter((g) => data.requiredGroupIds?.includes(g.id))
      : oldCategory.requiredGroups

    // Optimistically update the category
    const updatedCategory: CategoryWithGroups = {
      ...oldCategory,
      name: data.name ?? oldCategory.name,
      requiredGroups,
      updatedAt: new Date(),
    }
    setCategories((prev) => prev.map((c) => (c.id === id ? updatedCategory : c)))

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      })

      if (!res.ok) throw new Error('Failed to update category')

      const savedCategory = await res.json()
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? savedCategory : c))
      )
      showToast('Category updated successfully', 'success')
    } catch (error) {
      // Revert optimistic update on error
      setCategories((prev) => prev.map((c) => (c.id === id ? oldCategory : c)))
      console.error('Error updating category:', error)
      showToast('Failed to update category', 'error')
      throw error
    }
  }

  const deleteCategory = async (id: string) => {
    // Store the category before deletion for potential recovery
    const deletedCategory = categories.find((c) => c.id === id)
    if (!deletedCategory) return

    // Optimistically remove the category
    setCategories((prev) => prev.filter((c) => c.id !== id))

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (!res.ok) throw new Error('Failed to delete category')

      showToast('Category deleted successfully', 'success')
    } catch (error) {
      // Restore the category on error
      setCategories((prev) => [...prev, deletedCategory])
      console.error('Error deleting category:', error)
      showToast('Failed to delete category', 'error')
      throw error
    }
  }

  return {
    groups,
    categories,
    isLoading,
    refetch: fetchData,
    createGroup,
    updateGroup,
    deleteGroup,
    createCategory,
    updateCategory,
    deleteCategory,
  }
} 