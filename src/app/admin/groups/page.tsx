'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loading } from '@/components/ui/loading'
import { useAdminData } from '@/hooks/use-admin-data'

const emailSchema = z.string().email('Invalid email address')

const groupFormSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Name is required'),
  department: z.string().min(1, 'Department is required'),
  emails: z.string(),
})

const groupSchema = groupFormSchema.transform((data) => ({
  ...data,
  emails: data.emails
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean)
    .map((email) => emailSchema.parse(email)),
}))

type GroupFormData = z.infer<typeof groupFormSchema>

export default function AttendeeGroups() {
  const {
    groups,
    isLoading,
    createGroup,
    updateGroup,
    deleteGroup,
  } = useAdminData()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GroupFormData>({
    resolver: zodResolver(groupFormSchema),
  })

  const onSubmit = handleSubmit(async (data) => {
    try {
      const transformedData = await groupSchema.parseAsync(data)
      await createGroup(transformedData)
      reset()
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error:', error)
      } else {
        console.error('Error saving group:', error)
      }
    }
  })

  const handleEdit = (group: (typeof groups)[0]) => {
    reset({
      ...group,
      emails: group.emails.join(', '),
    })
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this group?')) {
      await deleteGroup(id)
    }
  }

  const handleCancel = () => {
    reset()
  }

  if (isLoading) {
    return <Loading text="Loading attendee groups..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Manage Attendee Groups
        </h1>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="id" className="block text-sm font-medium mb-1">
              Group ID *
            </label>
            <input
              {...register('id')}
              type="text"
              id="id"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="e.g., tech-team"
            />
            {errors.id && (
              <p className="text-red-500 text-sm mt-1">{errors.id.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Group Name *
            </label>
            <input
              {...register('name')}
              type="text"
              id="name"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="e.g., Technical Team"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="department" className="block text-sm font-medium mb-1">
            Department *
          </label>
          <input
            {...register('department')}
            type="text"
            id="department"
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="e.g., Technology"
          />
          {errors.department && (
            <p className="text-red-500 text-sm mt-1">{errors.department.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="emails" className="block text-sm font-medium mb-1">
            Email Addresses * (comma separated)
          </label>
          <textarea
            {...register('emails')}
            id="emails"
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="Enter valid email addresses (comma separated)"
          />
          {errors.emails && (
            <p className="text-red-500 text-sm mt-1">{errors.emails.message}</p>
          )}
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
          >
            Add Group
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
        <h2 className="text-lg font-semibold mb-4">Existing Groups</h2>
        <div className="grid gap-4">
          {groups.map((group) => (
            <div
              key={group.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium">{group.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ID: {group.id}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Department: {group.department}
                  </p>
                  <div className="mt-2">
                    <p className="text-sm font-medium">Members:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {group.emails.map((email) => (
                        <span
                          key={email}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary/10 text-secondary"
                        >
                          {email}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(group)}
                    className="text-secondary hover:text-secondary-dark"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(group.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {groups.length === 0 && (
            <p className="text-center text-gray-500">No groups found</p>
          )}
        </div>
      </div>
    </div>
  )
} 