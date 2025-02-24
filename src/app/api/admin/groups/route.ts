import { NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

const db = DatabaseService.getInstance()

export async function GET() {
  try {
    const groups = await db.getAttendeeGroups()
    return NextResponse.json(
      groups.map((group) => ({
        ...group,
        emails: JSON.parse(group.emails),
      }))
    )
  } catch (error) {
    console.error('Error fetching groups:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attendee groups' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const group = await db.createAttendeeGroup(data)
    return NextResponse.json({
      ...group,
      emails: JSON.parse(group.emails),
    })
  } catch (error) {
    console.error('Error creating group:', error)
    return NextResponse.json(
      { error: 'Failed to create attendee group' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...data } = await request.json()
    const group = await db.updateAttendeeGroup(id, data)
    return NextResponse.json({
      ...group,
      emails: JSON.parse(group.emails),
    })
  } catch (error) {
    console.error('Error updating group:', error)
    return NextResponse.json(
      { error: 'Failed to update attendee group' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    await db.deleteAttendeeGroup(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting group:', error)
    return NextResponse.json(
      { error: 'Failed to delete attendee group' },
      { status: 500 }
    )
  }
} 