import Countdown from '@/components/Countdown'
import DaysList from '@/components/DaysList'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <Countdown />
        <div className="mt-12 border-t border-gray-700 pt-12">
          <DaysList />
        </div>
      </div>
    </div>
  )
} 