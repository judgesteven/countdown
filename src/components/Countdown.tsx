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
          {/* Saudi Arabia Flag */}
          <svg 
            viewBox="0 0 900 600" 
            className="w-6 h-6"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="900" height="600" fill="#006C35"/>
            <path d="M450,300 L450,150 L500,150 L500,300 L450,300 Z" fill="#fff"/>
            <path d="M400,300 L400,150 L450,150 L450,300 L400,300 Z" fill="#fff"/>
            <path d="M350,300 L350,150 L400,150 L400,300 L350,300 Z" fill="#fff"/>
            <path d="M300,300 L300,150 L350,150 L350,300 L300,300 Z" fill="#fff"/>
            <path d="M250,300 L250,150 L300,150 L300,300 L250,300 Z" fill="#fff"/>
            <path d="M200,300 L200,150 L250,150 L250,300 L200,300 Z" fill="#fff"/>
            <path d="M150,300 L150,150 L200,150 L200,300 L150,300 Z" fill="#fff"/>
            <path d="M100,300 L100,150 L150,150 L150,300 L100,300 Z" fill="#fff"/>
            <path d="M50,300 L50,150 L100,150 L100,300 L50,300 Z" fill="#fff"/>
            <path d="M0,300 L0,150 L50,150 L50,300 L0,300 Z" fill="#fff"/>
            <path d="M500,300 L500,150 L550,150 L550,300 L500,300 Z" fill="#fff"/>
            <path d="M550,300 L550,150 L600,150 L600,300 L550,300 Z" fill="#fff"/>
            <path d="M600,300 L600,150 L650,150 L650,300 L600,300 Z" fill="#fff"/>
            <path d="M650,300 L650,150 L700,150 L700,300 L650,300 Z" fill="#fff"/>
            <path d="M700,300 L700,150 L750,150 L750,300 L700,300 Z" fill="#fff"/>
            <path d="M750,300 L750,150 L800,150 L800,300 L750,300 Z" fill="#fff"/>
            <path d="M800,300 L800,150 L850,150 L850,300 L800,300 Z" fill="#fff"/>
            <path d="M850,300 L850,150 L900,150 L900,300 L850,300 Z" fill="#fff"/>
            <path d="M450,450 L450,300 L500,300 L500,450 L450,450 Z" fill="#fff"/>
            <path d="M400,450 L400,300 L450,300 L450,450 L400,450 Z" fill="#fff"/>
            <path d="M350,450 L350,300 L400,300 L400,450 L350,450 Z" fill="#fff"/>
            <path d="M300,450 L300,300 L350,300 L350,450 L300,450 Z" fill="#fff"/>
            <path d="M250,450 L250,300 L300,300 L300,450 L250,450 Z" fill="#fff"/>
            <path d="M200,450 L200,300 L250,300 L250,450 L200,450 Z" fill="#fff"/>
            <path d="M150,450 L150,300 L200,300 L200,450 L150,450 Z" fill="#fff"/>
            <path d="M100,450 L100,300 L150,300 L150,450 L100,450 Z" fill="#fff"/>
            <path d="M50,450 L50,300 L100,300 L100,450 L50,450 Z" fill="#fff"/>
            <path d="M0,450 L0,300 L50,300 L50,450 L0,450 Z" fill="#fff"/>
            <path d="M500,450 L500,300 L550,300 L550,450 L500,450 Z" fill="#fff"/>
            <path d="M550,450 L550,300 L600,300 L600,450 L550,450 Z" fill="#fff"/>
            <path d="M600,450 L600,300 L650,300 L650,450 L600,450 Z" fill="#fff"/>
            <path d="M650,450 L650,300 L700,300 L700,450 L650,450 Z" fill="#fff"/>
            <path d="M700,450 L700,300 L750,300 L750,450 L700,450 Z" fill="#fff"/>
            <path d="M750,450 L750,300 L800,300 L800,450 L750,450 Z" fill="#fff"/>
            <path d="M800,450 L800,300 L850,300 L850,450 L800,450 Z" fill="#fff"/>
            <path d="M850,450 L850,300 L900,300 L900,450 L850,450 Z" fill="#fff"/>
            <path d="M450,600 L450,450 L500,450 L500,600 L450,600 Z" fill="#fff"/>
            <path d="M400,600 L400,450 L450,450 L450,600 L400,600 Z" fill="#fff"/>
            <path d="M350,600 L350,450 L400,450 L400,600 L350,600 Z" fill="#fff"/>
            <path d="M300,600 L300,450 L350,450 L350,600 L300,600 Z" fill="#fff"/>
            <path d="M250,600 L250,450 L300,450 L300,600 L250,600 Z" fill="#fff"/>
            <path d="M200,600 L200,450 L250,450 L250,600 L200,600 Z" fill="#fff"/>
            <path d="M150,600 L150,450 L200,450 L200,600 L150,600 Z" fill="#fff"/>
            <path d="M100,600 L100,450 L150,450 L150,600 L100,600 Z" fill="#fff"/>
            <path d="M50,600 L50,450 L100,450 L100,600 L50,600 Z" fill="#fff"/>
            <path d="M0,600 L0,450 L50,450 L50,600 L0,600 Z" fill="#fff"/>
            <path d="M500,600 L500,450 L550,450 L550,600 L500,600 Z" fill="#fff"/>
            <path d="M550,600 L550,450 L600,450 L600,600 L550,600 Z" fill="#fff"/>
            <path d="M600,600 L600,450 L650,450 L650,600 L600,600 Z" fill="#fff"/>
            <path d="M650,600 L650,450 L700,450 L700,600 L650,600 Z" fill="#fff"/>
            <path d="M700,600 L700,450 L750,450 L750,600 L700,600 Z" fill="#fff"/>
            <path d="M750,600 L750,450 L800,450 L800,600 L750,600 Z" fill="#fff"/>
            <path d="M800,600 L800,450 L850,450 L850,600 L800,600 Z" fill="#fff"/>
            <path d="M850,600 L850,450 L900,450 L900,600 L850,600 Z" fill="#fff"/>
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
          {/* Finland Flag */}
          <svg 
            viewBox="0 0 900 600" 
            className="w-6 h-6"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="900" height="600" fill="#fff"/>
            <rect x="300" width="60" height="600" fill="#003580"/>
            <rect y="250" width="900" height="60" fill="#003580"/>
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