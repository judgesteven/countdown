import Countdown from '@/components/Countdown'
import DaysList from '@/components/DaysList'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex items-center justify-center">
            <Countdown />
          </div>
          <div className="flex items-start justify-center">
            <DaysList />
          </div>
        </div>
      </div>
    </div>
  )
} 