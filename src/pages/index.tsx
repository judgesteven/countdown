import { useState } from 'react';
import Countdown from '@/components/Countdown';
import WeightTracking from '@/components/WeightTracking';

export default function Home() {
  const [currentPage, setCurrentPage] = useState<'countdown' | 'weight'>('countdown');

  return (
    <div className="min-h-screen bg-gray-900 relative">
      {/* Toggle Button in Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <div className="flex gap-2 bg-gray-800 rounded-lg p-1 border border-gray-700">
          <button
            onClick={() => setCurrentPage('countdown')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
              currentPage === 'countdown'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Countdown
          </button>
          <button
            onClick={() => setCurrentPage('weight')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
              currentPage === 'weight'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Weight
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center">
          {currentPage === 'countdown' ? <Countdown /> : <WeightTracking />}
        </div>
      </div>
    </div>
  )
} 