'use client';

import { useEffect, useState } from 'react';

const Countdown = () => {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0
  });
  const [progress, setProgress] = useState(0);
  const [daysList, setDaysList] = useState<{ date: string; isPast: boolean; dateObj: Date }[]>([]);
  const [dayMarkers, setDayMarkers] = useState<number[]>([]);

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

  // Fixed start date: May 9th, 2025 at 2am CET+1
  const startTime = toCET(new Date(2025, 4, 9, 2, 0, 0)); // Month is 0-based, so 4 = May
  // Fixed end date: June 7th, 2025 at 2am CET+1
  const endTime = toCET(new Date(2025, 5, 7, 2, 0, 0)); // Month is 0-based, so 5 = June

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
    const days: { date: string; isPast: boolean; dateObj: Date }[] = [];
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

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-white">
        <h1 className="text-4xl font-bold mb-8">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 text-white px-4">
      <h1 className="text-4xl font-bold mb-8">Countdown until Finland</h1>
      <div className="w-[80vw] mb-8">
        <div className="flex items-center gap-4">
          {/* Saudi Arabia Flag - simple green with white sword */}
          <svg
            viewBox="0 0 24 24"
            className="w-6 h-6"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Saudi Arabia flag"
          >
            <rect width="24" height="24" fill="#006C35" rx="3"/>
            <rect x="5" y="16" width="14" height="2" rx="1" fill="#fff"/>
            <rect x="17" y="15.5" width="1.5" height="3" rx="0.75" fill="#fff"/>
          </svg>
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
          {/* Finland Flag - white with blue cross */}
          <svg
            viewBox="0 0 24 24"
            className="w-6 h-6"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Finland flag"
          >
            <rect width="24" height="24" fill="#fff" rx="3"/>
            <rect x="9" width="3" height="24" fill="#003580"/>
            <rect y="10" width="24" height="4" fill="#003580"/>
          </svg>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-8 text-center mb-12">
        <div className="flex flex-col">
          <span className="text-6xl font-bold">{timeLeft.days}</span>
          <span className="text-xl">Days</span>
        </div>
        <div className="flex flex-col">
          <span className="text-6xl font-bold">{timeLeft.hours}</span>
          <span className="text-xl">Hours</span>
        </div>
        <div className="flex flex-col">
          <span className="text-6xl font-bold">{timeLeft.minutes}</span>
          <span className="text-xl">Minutes</span>
        </div>
      </div>
      <div className="w-[80vw]">
        <div className="grid grid-cols-7 gap-2">
          {daysList.map((day, index) => (
            <div 
              key={index}
              className={`bg-gray-800 rounded-lg p-2 text-center hover:bg-gray-700 transition-colors text-sm ${
                day.isPast ? 'opacity-50' : ''
              }`}
            >
              {day.date}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Countdown; 