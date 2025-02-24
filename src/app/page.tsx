import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-primary mb-8">
          Flexothene Technical Meetings
        </h1>
        
        <div className="bg-background-light dark:bg-background-dark rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Schedule a Meeting</h2>
          
          <div className="space-y-4">
            <Link 
              href="/meetings/new"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
            >
              New Meeting
            </Link>
            
            <Link
              href="/meetings"
              className="inline-flex items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-white hover:bg-secondary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 ml-4"
            >
              View Meetings
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
