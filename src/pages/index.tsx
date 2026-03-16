import Countdown from '@/components/Countdown';
import WeightTracking from '@/components/WeightTracking';
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 relative">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center gap-12">
          <Countdown />
          <WeightTracking />
        </div>
      </div>
    </div>
  )
}