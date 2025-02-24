import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { GraphService } from '@/lib/microsoft-graph'

export async function middleware(request: NextRequest) {
  // Check if the route is an admin route
  if (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/api/admin')) {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    try {
      const token = authHeader.split(' ')[1]
      const graphService = GraphService.getInstance()
      await graphService.validateToken(token)

      // Add validation for admin role here if needed
      // For now, we're just checking if the user is authenticated

      return NextResponse.next()
    } catch (error) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
} 