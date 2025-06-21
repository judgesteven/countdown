'use client';

import { useEffect, useState } from 'react';

interface DayData {
  date: string;
  isPast: boolean;
  dateObj: Date;
  kmsRun?: number;
  kmsWalked?: number;
  weight?: number;
}

const Countdown = () => {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0
  });
  const [progress, setProgress] = useState(0);
  const [daysList, setDaysList] = useState<DayData[]>([]);
  const [dayMarkers, setDayMarkers] = useState<number[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [kmsRun, setKmsRun] = useState('');
  const [kmsWalked, setKmsWalked] = useState('');
  const [weight, setWeight] = useState('');

  // Helper function to convert to CET+1
  const toCET = (date: Date) => {
    const cetDate = new Date(date.toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
    cetDate.setHours(cetDate.getHours() + 1); // Add 1 hour for CET+1
    return cetDate;
  };

  // Helper function to get start of day in CET+1
  const getStartOfDay = (date: Date) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return toCET(start);
  };

  // Helper function to get end of day in CET+1
  const getEndOfDay = (date: Date) => {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return toCET(end);
  };

  // Helper function to get time until next hour
  const getTimeUntilNextHour = () => {
    const now = toCET(new Date());
    const nextHour = new Date(now);
    nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
    return nextHour.getTime() - now.getTime();
  };

  // Fixed start date: Saturday 21st June, 2025 at 01:00 CET+1
  const startTime = toCET(new Date(2025, 5, 21, 1, 0, 0)); // Month is 0-based, so 5 = June
  // Fixed end date: Saturday 5th July, 2025 at 01:00 CET+1
  const endTime = toCET(new Date(2025, 6, 5, 1, 0, 0)); // Month is 0-based, so 6 = July

  useEffect(() => {
    setMounted(true);

    const totalHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    const totalDays = Math.ceil(totalHours / 24);

    // Calculate day marker positions
    const markers = Array.from({ length: totalDays - 1 }, (_, i) => {
      const hoursFromStart = (i + 1) * 24;
      return (hoursFromStart / totalHours) * 100;
    });
    setDayMarkers(markers);

    // Generate list of days between start and end dates
    const days: DayData[] = [];
    const currentDate = new Date(startTime);
    while (currentDate <= endTime) {
      const dateString = currentDate.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        timeZone: 'Europe/Paris' // Use Paris timezone for CET
      });
      days.push({
        date: dateString,
        isPast: false,
        dateObj: new Date(currentDate)
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Load saved distances and weight from localStorage
    const loadDistances = () => {
      try {
        const savedDistances = localStorage.getItem('workout-distances');
        if (savedDistances) {
          const distances = JSON.parse(savedDistances);
          days.forEach(day => {
            if (distances[day.date]) {
              day.kmsRun = distances[day.date].kmsRun;
              day.kmsWalked = distances[day.date].kmsWalked;
              day.weight = distances[day.date].weight;
            }
          });
        }
      } catch (error) {
        console.error('Failed to load distances from localStorage:', error);
      }
    };

    loadDistances();
    setDaysList(days);

    const calculateTimeLeft = () => {
      const now = toCET(new Date()); // Convert current time to CET+1
      const difference = endTime.getTime() - now.getTime();
      
      if (difference > 0) {
        // Calculate progress based on hours elapsed
        const hoursElapsed = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        const currentProgress = (hoursElapsed / totalHours) * 100;
        setProgress(Math.min(currentProgress, 100));

        // Calculate days, hours, and minutes
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

        setTimeLeft({
          days,
          hours,
          minutes
        });

        // Update past days - only mark as past if we're past the end of that day in CET+1
        setDaysList(prevDays => 
          prevDays.map(day => {
            const dayStart = getStartOfDay(day.dateObj);
            const dayEnd = getEndOfDay(day.dateObj);
            const isPast = now > dayEnd;
            
            return {
              ...day,
              isPast
            };
          })
        );
      } else {
        // If we've passed the end date, set progress to 100%
        setProgress(100);
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    // Set up hourly refresh
    const scheduleNextRefresh = () => {
      const timeUntilNextHour = getTimeUntilNextHour();
      setTimeout(() => {
        window.location.reload();
      }, timeUntilNextHour);
    };

    scheduleNextRefresh();

    return () => {
      clearInterval(timer);
    };
  }, []);

  const handleDayClick = (day: DayData) => {
    setSelectedDay(day);
    setKmsRun(day.kmsRun?.toString() || '');
    setKmsWalked(day.kmsWalked?.toString() || '');
    setWeight(day.weight?.toString() || '');
  };

  const handleSubmit = () => {
    if (selectedDay) {
      const updatedDays = daysList.map(day =>
        day.date === selectedDay.date
          ? {
              ...day,
              kmsRun: kmsRun ? parseFloat(kmsRun) : undefined,
              kmsWalked: kmsWalked ? parseFloat(kmsWalked) : undefined,
              weight: weight ? parseFloat(weight) : undefined
            }
          : day
      );
      setDaysList(updatedDays);

      // Save to localStorage
      const distances: Record<string, { kmsRun?: number; kmsWalked?: number; weight?: number }> = {};
      updatedDays.forEach(day => {
        if (day.kmsRun !== undefined || day.kmsWalked !== undefined || day.weight !== undefined) {
          distances[day.date] = {
            kmsRun: day.kmsRun,
            kmsWalked: day.kmsWalked,
            weight: day.weight
          };
        }
      });
      
      localStorage.setItem('workout-distances', JSON.stringify(distances));
      setSelectedDay(null);
      console.log('Workout data saved successfully!');
    }
  };

  const totalKmsRun = daysList.reduce((sum, day) => sum + (day.kmsRun || 0), 0);
  const totalKmsWalked = daysList.reduce((sum, day) => sum + (day.kmsWalked || 0), 0);

  // Weight data calculations
  const startWeight = daysList[0]?.weight;
  const currentWeight = daysList[daysList.length - 1]?.weight;
  const weightChange = startWeight !== undefined && currentWeight !== undefined 
    ? (currentWeight - startWeight).toFixed(1) 
    : null;

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-white">
        <h1 className="text-4xl font-bold mb-8">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 text-white px-4">
      <h1 className="text-4xl font-bold mb-8">The Great Escape</h1>
      <div className="w-[80vw] mb-8">
        <div className="flex items-center gap-4">
          {/* Saudi Arabia Flag */}
          <img src="/Flag_of_Saudi_Arabia.svg.png" alt="Saudi Arabia flag" className="w-8 h-8" />
          <div className="flex-1 bg-gray-700 rounded-full h-4 relative">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
            {dayMarkers.map((position, index) => (
              <div
                key={index}
                className="absolute top-0 bottom-0 w-px bg-gray-500 opacity-30"
                style={{ left: `${position}%` }}
              />
            ))}
          </div>
          {/* Finland Flag */}
          <img src="/Flag_of_UK.png" alt="UK flag" className="w-8 h-8" />
          {/* Spain Flag */}
          <img src="/Flag_of_Spain.png" alt="Spain flag" className="w-8 h-8" />
          {/* Finland Flag */}
          <img src="/Flag_of_Finland_new.png" alt="Finland flag" className="w-8 h-8" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-8 text-center mb-12">
        <div className="flex flex-col items-center">
          <span className="text-8xl font-bold">{timeLeft.days}</span>
          <span className="text-xl">Days</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-8xl font-bold">{timeLeft.hours}</span>
          <span className="text-xl">Hours</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-8xl font-bold">{timeLeft.minutes}</span>
          <span className="text-xl">Minutes</span>
        </div>
      </div>
      <div className="w-[80vw]">
        <div className="grid grid-cols-7 gap-2">
          {daysList.map((day, index) => (
            <div 
              key={index}
              className={`bg-gray-800 rounded-lg p-2 text-center hover:bg-gray-700 transition-colors text-sm cursor-pointer ${
                day.isPast ? 'opacity-50' : ''
              }`}
              onClick={() => handleDayClick(day)}
            >
              <div>{day.date}</div>
              {day.kmsRun !== undefined && (
                <div className="text-green-400">Run: {day.kmsRun.toFixed(1)}km</div>
              )}
              {day.kmsWalked !== undefined && (
                <div className="text-blue-400">Walk: {day.kmsWalked.toFixed(1)}km</div>
              )}
              {day.weight !== undefined && (
                <div className="text-yellow-400">Weight: {day.weight.toFixed(1)}kg</div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <div className="text-xl font-bold mb-2">Workout Data</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-green-400">Total Run: {totalKmsRun.toFixed(1)}km</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-blue-400">Total Walk: {totalKmsWalked.toFixed(1)}km</div>
            </div>
          </div>
        </div>
        
        {/* Weight Data Section */}
        <div className="mt-8 text-center">
          <div className="text-xl font-bold mb-2">Weight Data</div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-yellow-400">
                Starting Weight: {daysList[0]?.weight !== undefined ? daysList[0].weight.toFixed(1) : 'Not set'}kg
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-yellow-400">
                Current Weight: {daysList[daysList.length - 1]?.weight !== undefined ? daysList[daysList.length - 1].weight.toFixed(1) : 'Not set'}kg
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-yellow-400">
                Change: {weightChange ? `${weightChange}kg` : 'Not available'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popup */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">{selectedDay.date}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">KMs Run</label>
                <input
                  type="number"
                  value={kmsRun}
                  onChange={(e) => setKmsRun(e.target.value)}
                  className="w-full bg-gray-700 rounded px-3 py-2"
                  placeholder="Enter KMs run"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">KMs Walked</label>
                <input
                  type="number"
                  value={kmsWalked}
                  onChange={(e) => setKmsWalked(e.target.value)}
                  className="w-full bg-gray-700 rounded px-3 py-2"
                  placeholder="Enter KMs walked"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full bg-gray-700 rounded px-3 py-2"
                  placeholder="Enter weight in kg"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setSelectedDay(null)}
                  className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Countdown; 