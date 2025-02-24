'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loading } from '@/components/ui/loading'
import { useAdminData } from '@/hooks/use-admin-data'

const categoryFormSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Name is required'),
  requiredGroups: z.string(),
})

type CategoryFormData = z.infer<typeof categoryFormSchema>

export default function ProductCategories() {
  const {
    groups,
    categories,
    isLoading,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useAdminData()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
  })

  const onSubmit = handleSubmit(async (data) => {
    try {
      const groupIds = data.requiredGroups
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean)

      // Validate that all group IDs exist
      const invalidGroups = groupIds.filter(
        (groupId) => !groups.some((g) => g.id === groupId)
      )

      if (invalidGroups.length > 0) {
        console.error(`Invalid group IDs: ${invalidGroups.join(', ')}`)
        return
      }

      await createCategory({
        id: data.id,
        name: data.name,
        requiredGroupIds: groupIds,
      })
      reset()
    } catch (error) {
      console.error('Error saving category:', error)
    }
  })

  const handleEdit = (category: (typeof categories)[0]) => {
    reset({
      ...category,
      requiredGroups: category.requiredGroups.map((g) => g.id).join(', '),
    })
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      await deleteCategory(id)
    }
  }

  const handleCancel = () => {
    reset()
  }

  if (isLoading) {
    return <Loading text="Loading product categories..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Manage Product Categories
        </h1>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="id" className="block text-sm font-medium mb-1">
              Category ID *
            </label>
            <input
              {...register('id')}
              type="text"
              id="id"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="e.g., technical-review"
            />
            {errors.id && (
              <p className="text-red-500 text-sm mt-1">{errors.id.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Category Name *
            </label>
            <input
              {...register('name')}
              type="text"
              id="name"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="e.g., Technical Review"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="requiredGroups" className="block text-sm font-medium mb-1">
            Required Groups * (comma separated)
          </label>
          <textarea
            {...register('requiredGroups')}
            id="requiredGroups"
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="Enter group IDs (comma separated)"
          />
          {errors.requiredGroups && (
            <p className="text-red-500 text-sm mt-1">{errors.requiredGroups.message}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Available groups: {groups.map((g) => `${g.id} (${g.name})`).join(', ')}
          </p>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
          >
            Add Category
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Existing Categories</h2>
        <div className="grid gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium">{category.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ID: {category.id}
                  </p>
                  <div className="mt-2">
                    <p className="text-sm font-medium">Required Groups:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {category.requiredGroups.map((group) => (
                        <span
                          key={group.id}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary/10 text-secondary"
                        >
                          {group.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="text-secondary hover:text-secondary-dark"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {categories.length === 0 && (
            <p className="text-center text-gray-500">No categories found</p>
          )}
        </div>
      </div>
    </div>
  )
} 