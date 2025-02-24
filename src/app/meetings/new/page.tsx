'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format, addMinutes } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/providers/auth-provider'
import { GraphService } from '@/lib/microsoft-graph'
import { Loading } from '@/components/ui/loading'
import { useToast } from '@/components/providers/toast-provider'
import { productCategories, getRequiredAttendeesForCategory } from '@/config/attendee-groups'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB in bytes

const meetingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  category: z.string().min(1, 'Please select a category'),
  date: z.string(),
  time: z.string(),
  duration: z.number().min(15, 'Duration must be at least 15 minutes'),
  additionalAttendees: z.string().optional(),
  documents: z
    .instanceof(FileList)
    .refine((files) => {
      if (files.length === 0) return true
      let totalSize = 0
      for (let i = 0; i < files.length; i++) {
        totalSize += files[i].size
      }
      return totalSize <= MAX_FILE_SIZE
    }, 'Total file size must not exceed 10MB')
    .optional(),
})

type MeetingFormData = z.infer<typeof meetingSchema>

export default function NewMeeting() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { isAuthenticated, isLoading: authLoading, login } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()
  const graphService = GraphService.getInstance()
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      duration: 30,
    },
  })

  const selectedCategory = watch('category')
  const requiredAttendees = selectedCategory ? getRequiredAttendeesForCategory(selectedCategory) : []
  const documents = watch('documents')

  const getTotalFileSize = (files: FileList | null) => {
    if (!files) return 0
    let totalSize = 0
    for (let i = 0; i < files.length; i++) {
      totalSize += files[i].size
    }
    return totalSize
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const onSubmit = async (data: MeetingFormData) => {
    if (!isAuthenticated) {
      try {
        await login()
      } catch (error) {
        console.error('Failed to login:', error)
        showToast('Failed to authenticate. Please try again.', 'error')
        return
      }
    }

    setIsSubmitting(true)
    try {
      const startDate = new Date(`${data.date}T${data.time}`)
      const endDate = addMinutes(startDate, data.duration)

      // Combine required and additional attendees
      const allAttendees = [
        ...requiredAttendees,
        ...(data.additionalAttendees?.split(',').map((email) => email.trim()).filter(Boolean) || []),
      ]

      await graphService.createMeeting({
        subject: data.title,
        body: data.description,
        start: startDate,
        end: endDate,
        attendees: allAttendees,
      })

      // TODO: Handle document uploads

      showToast('Meeting scheduled successfully', 'success')
      router.push('/meetings')
    } catch (error) {
      console.error('Error scheduling meeting:', error)
      showToast('Failed to schedule meeting. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="container mx-auto py-8">
        <Loading text="Loading..." />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-primary mb-8">Schedule New Meeting</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Meeting Title *
          </label>
          <input
            {...register('title')}
            type="text"
            id="title"
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="Enter meeting title"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1">
            Meeting Category *
          </label>
          <select
            {...register('category')}
            id="category"
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="">Select a category</option>
            {productCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            {...register('description')}
            id="description"
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="Enter meeting description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium mb-1">
              Date *
            </label>
            <input
              {...register('date')}
              type="date"
              id="date"
              min={format(new Date(), 'yyyy-MM-dd')}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
            {errors.date && (
              <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="time" className="block text-sm font-medium mb-1">
              Time *
            </label>
            <input
              {...register('time')}
              type="time"
              id="time"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
            {errors.time && (
              <p className="text-red-500 text-sm mt-1">{errors.time.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-medium mb-1">
            Duration (minutes) *
          </label>
          <input
            {...register('duration', { valueAsNumber: true })}
            type="number"
            id="duration"
            min="15"
            step="15"
            defaultValue="30"
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
          {errors.duration && (
            <p className="text-red-500 text-sm mt-1">{errors.duration.message}</p>
          )}
        </div>

        {selectedCategory && requiredAttendees.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Required Attendees
            </label>
            <div className="flex flex-wrap gap-2">
              {requiredAttendees.map((email) => (
                <span
                  key={email}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary/10 text-secondary"
                >
                  {email}
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <label htmlFor="additionalAttendees" className="block text-sm font-medium mb-1">
            Additional Attendees
          </label>
          <input
            {...register('additionalAttendees')}
            type="text"
            id="additionalAttendees"
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="Enter email addresses (comma separated)"
          />
        </div>

        <div>
          <label htmlFor="documents" className="block text-sm font-medium mb-1">
            Upload Documents (Max 10MB total)
          </label>
          <input
            {...register('documents')}
            type="file"
            id="documents"
            multiple
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
          {documents && documents.length > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              Total size: {formatFileSize(getTotalFileSize(documents))}
            </p>
          )}
          {errors.documents && (
            <p className="text-red-500 text-sm mt-1">{errors.documents.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 disabled:opacity-50"
        >
          {isSubmitting ? 'Scheduling...' : 'Schedule Meeting'}
        </button>
      </form>
    </div>
  )
} 