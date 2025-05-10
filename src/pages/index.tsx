import Countdown from '@/components/Countdown'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center">
          <Countdown />
        </div>
      </div>
    </div>
  )
} 