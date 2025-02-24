'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format, addMinutes, parseISO } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/providers/auth-provider'
import { GraphService } from '@/lib/microsoft-graph'
import { Loading } from '@/components/ui/loading'
import { useToast } from '@/components/providers/toast-provider'

const meetingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  date: z.string(),
  time: z.string(),
  duration: z.number().min(15, 'Duration must be at least 15 minutes'),
  attendees: z.string().transform((str) => 
    str.split(',').map((email) => email.trim()).filter(Boolean)
  ),
})

type MeetingFormData = z.infer<typeof meetingSchema>

interface MeetingAttendee {
  emailAddress: {
    address: string
  }
  type: string
}

interface Meeting {
  id: string
  subject: string
  body?: {
    content: string
  }
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  attendees: MeetingAttendee[]
}

export default function EditMeeting({ params }: { params: { id: string } }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { isAuthenticated, isLoading: authLoading, login } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()
  const graphService = GraphService.getInstance()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema),
  })

  useEffect(() => {
    const fetchMeeting = async () => {
      if (!isAuthenticated) {
        try {
          await login()
        } catch (error) {
          console.error('Failed to login:', error)
          showToast('Failed to authenticate. Please try again.', 'error')
          setIsLoading(false)
          return
        }
      }

      try {
        const response = await graphService.getMeetings()
        const meeting = response.find((m: Meeting) => m.id === params.id)
        
        if (!meeting) {
          console.error('Meeting not found')
          showToast('Meeting not found', 'error')
          router.push('/meetings')
          return
        }

        const startDate = parseISO(meeting.start.dateTime)
        const endDate = parseISO(meeting.end.dateTime)
        const duration = Math.round((endDate.getTime() - startDate.getTime()) / 1000 / 60)

        reset({
          title: meeting.subject,
          description: meeting.body?.content || '',
          date: format(startDate, 'yyyy-MM-dd'),
          time: format(startDate, 'HH:mm'),
          duration,
          attendees: meeting.attendees.map((attendee: MeetingAttendee) => attendee.emailAddress.address).join(', '),
        })
      } catch (error) {
        console.error('Error fetching meeting:', error)
        showToast('Failed to load meeting details. Please try again.', 'error')
      } finally {
        setIsLoading(false)
      }
    }

    if (!authLoading) {
      fetchMeeting()
    }
  }, [isAuthenticated, authLoading, login, params.id, reset, router, showToast])

  const onSubmit = async (data: MeetingFormData) => {
    setIsSubmitting(true)
    try {
      const startDate = new Date(`${data.date}T${data.time}`)
      const endDate = addMinutes(startDate, data.duration)

      await graphService.updateMeeting(params.id, {
        subject: data.title,
        body: data.description,
        start: startDate,
        end: endDate,
        attendees: data.attendees,
      })

      showToast('Meeting updated successfully', 'success')
      router.push('/meetings')
    } catch (error) {
      console.error('Error updating meeting:', error)
      showToast('Failed to update meeting. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Loading text="Loading meeting details..." />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-primary mb-8">Edit Meeting</h1>
      
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
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
          {errors.duration && (
            <p className="text-red-500 text-sm mt-1">{errors.duration.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="attendees" className="block text-sm font-medium mb-1">
            Attendees *
          </label>
          <input
            {...register('attendees')}
            type="text"
            id="attendees"
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="Enter email addresses (comma separated)"
          />
          {errors.attendees && (
            <p className="text-red-500 text-sm mt-1">{errors.attendees.message}</p>
          )}
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/meetings')}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
} 