'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { useAuth } from '@/app/providers/auth-provider'
import { GraphService } from '@/lib/microsoft-graph'
import { Loading } from '@/components/ui/loading'
import { useToast } from '@/components/providers/toast-provider'

interface Meeting {
  id: string
  subject: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  attendees: {
    emailAddress: {
      address: string
    }
    type: string
  }[]
  onlineMeeting?: {
    joinUrl: string
  }
}

export default function MeetingsList() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { isAuthenticated, isLoading: authLoading, login } = useAuth()
  const { showToast } = useToast()
  const graphService = GraphService.getInstance()

  useEffect(() => {
    const fetchMeetings = async () => {
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
        const startDate = new Date()
        const endDate = new Date()
        endDate.setMonth(endDate.getMonth() + 1) // Get meetings for the next month

        const response = await graphService.getMeetings(startDate, endDate)
        setMeetings(response)
      } catch (error) {
        console.error('Error fetching meetings:', error)
        showToast('Failed to load meetings. Please try again.', 'error')
      } finally {
        setIsLoading(false)
      }
    }

    if (!authLoading) {
      fetchMeetings()
    }
  }, [isAuthenticated, authLoading, login, showToast])

  const handleDelete = async (meetingId: string) => {
    if (confirm('Are you sure you want to delete this meeting?')) {
      try {
        await graphService.deleteMeeting(meetingId)
        setMeetings(meetings.filter(meeting => meeting.id !== meetingId))
        showToast('Meeting deleted successfully', 'success')
      } catch (error) {
        console.error('Error deleting meeting:', error)
        showToast('Failed to delete meeting. Please try again.', 'error')
      }
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Loading text="Loading meetings..." />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Scheduled Meetings</h1>
        <Link
          href="/meetings/new"
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
        >
          Schedule New Meeting
        </Link>
      </div>

      <div className="grid gap-4">
        {meetings.map((meeting) => (
          <div
            key={meeting.id}
            className="bg-background-light dark:bg-background-dark rounded-lg shadow-md p-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold mb-2">{meeting.subject}</h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {format(new Date(meeting.start.dateTime), 'PPP')} at{' '}
                  {format(new Date(meeting.start.dateTime), 'p')}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Duration:{' '}
                  {Math.round(
                    (new Date(meeting.end.dateTime).getTime() -
                      new Date(meeting.start.dateTime).getTime()) /
                      1000 /
                      60
                  )}{' '}
                  minutes
                </p>
                {meeting.onlineMeeting && (
                  <a
                    href={meeting.onlineMeeting.joinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary hover:text-secondary-dark mt-2 inline-block"
                  >
                    Join Teams Meeting
                  </a>
                )}
              </div>
              <div className="flex space-x-2">
                <Link
                  href={`/meetings/${meeting.id}/edit`}
                  className="text-secondary hover:text-secondary-dark focus:outline-none"
                >
                  Edit
                </Link>
                <button
                  className="text-red-500 hover:text-red-700 focus:outline-none"
                  onClick={() => handleDelete(meeting.id)}
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Attendees:</h3>
              <div className="flex flex-wrap gap-2">
                {meeting.attendees.map((attendee) => (
                  <span
                    key={attendee.emailAddress.address}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary/10 text-secondary"
                  >
                    {attendee.emailAddress.address}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}

        {meetings.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No meetings scheduled</p>
          </div>
        )}
      </div>
    </div>
  )
} 