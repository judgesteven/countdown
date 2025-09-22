'use client';

import { useEffect, useState } from 'react';

interface DayData {
  date: string;
  isPast: boolean;
  isSpecialGreen?: boolean;
  isSpecialBlue?: boolean;
  isSpecialRed?: boolean;
  isOverlapping?: boolean;
  dateObj: Date;
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
  const [mayCountdown, setMayCountdown] = useState({
    months: 0,
    weeks: 0,
    days: 0
  });

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

  // Fixed start date: Friday 12th September, 2025 at 21:00 CET+1
  const startTime = new Date('2025-09-12T21:00:00+02:00'); // Friday 12th September at 21:00 CET+1
  // Fixed end date: Thursday 9th October, 2025 at 00:00 CET+1
  const endTime = new Date('2025-10-09T00:00:00+02:00'); // Thursday 9th October at 00:00 CET+1

  // Helper function to get month data
  const getMonthData = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday
    
    const days = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= lastDay || currentDate.getDay() !== 0) {
      const isCurrentMonth = currentDate.getMonth() === month;
      
      // Fix: Compare only the date part, not the full datetime
      const today = new Date();
      const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      const isPast = currentDateOnly < todayDate;
      
      const isInRange = currentDate >= startTime && currentDate <= endTime;
      
      // Check if date is in special green ranges
      const isSpecialGreen = 
        (currentDate >= new Date(2025, 7, 29) && currentDate <= new Date(2025, 8, 12)) || // Aug 29 - Sep 12
        (currentDate >= new Date(2025, 9, 10) && currentDate <= new Date(2025, 9, 24)) || // Oct 10 - Oct 24
        (currentDate >= new Date(2025, 10, 14) && currentDate <= new Date(2025, 10, 28)) || // Nov 14 - Nov 28
        (currentDate >= new Date(2025, 11, 5) && currentDate <= new Date(2025, 11, 7)) || // Dec 5 - Dec 7
        (currentDate >= new Date(2025, 11, 19) && currentDate <= new Date(2026, 0, 9)) || // Dec 19 - Jan 9
        (currentDate >= new Date(2026, 2, 6) && currentDate <= new Date(2026, 2, 20)) || // Mar 6 - Mar 20
        (currentDate >= new Date(2026, 3, 3) && currentDate <= new Date(2026, 3, 17)); // Apr 3 - Apr 17
      
      // Check if date is in special blue range
      const isSpecialBlue = 
        (currentDate >= new Date(2025, 8, 21) && currentDate <= new Date(2025, 8, 28)); // Sep 21 - Sep 28
      
      // Check if date is May 5th (special red highlighting)
      const isSpecialRed = 
        (currentDate.getFullYear() === 2026 && currentDate.getMonth() === 4 && currentDate.getDate() === 5); // May 5, 2026
      
      // Check if this date appears in multiple months (overlapping)
      const isOverlapping = !isCurrentMonth && (isSpecialGreen || isSpecialBlue || isSpecialRed);
      
      days.push({
        date: currentDate.getDate(),
        isCurrentMonth,
        isPast,
        isInRange,
        isSpecialGreen,
        isSpecialBlue,
        isSpecialRed,
        isOverlapping,
        dateObj: new Date(currentDate)
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  useEffect(() => {
    setMounted(true);
    
    // Simplified initialization
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
        timeZone: 'Europe/Paris'
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
      const now = toCET(new Date());
      const difference = endTime.getTime() - now.getTime();
      
      if (difference > 0) {
        const hoursElapsed = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        const currentProgress = (hoursElapsed / totalHours) * 100;
        setProgress(Math.min(currentProgress, 100));

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

        setTimeLeft({ days, hours, minutes });

        setDaysList(prevDays => 
          prevDays.map(day => {
            const dayStart = getStartOfDay(day.dateObj);
            const dayEnd = getEndOfDay(day.dateObj);
            const isPast = now > dayEnd;
            return { ...day, isPast };
          })
        );
      } else {
        setProgress(100);
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
      }
    };

    const calculateMayCountdown = () => {
      const now = toCET(new Date());
      const may5th = new Date('2026-05-05T00:00:00+02:00'); // May 5th, 2026 at midnight CET+1
      const difference = may5th.getTime() - now.getTime();
      
      if (difference > 0) {
        const totalDays = Math.floor(difference / (1000 * 60 * 60 * 24));
        const months = Math.floor(totalDays / 30); // Approximate months
        const remainingDays = totalDays % 30;
        const weeks = Math.floor(remainingDays / 7);
        const days = remainingDays % 7;
        
        setMayCountdown({ months, weeks, days });
      } else {
        setMayCountdown({ months: 0, weeks: 0, days: 0 });
      }
    };

    calculateTimeLeft();
    calculateMayCountdown();
    const timer = setInterval(() => {
      calculateTimeLeft();
      calculateMayCountdown();
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Temporarily remove mounted check to debug
  // if (!mounted) {
  //   return (
  //     <div className="flex flex-col items-center justify-center py-12 text-white">
  //       <h1 className="text-4xl font-bold mb-8">Loading...</h1>
  //     </div>
  //   );
  // }

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    { name: 'September 2025', year: 2025, month: 8 },
    { name: 'October 2025', year: 2025, month: 9 },
    { name: 'November 2025', year: 2025, month: 10 },
    { name: 'December 2025', year: 2025, month: 11 },
    { name: 'January 2026', year: 2026, month: 0 },
    { name: 'February 2026', year: 2026, month: 1 },
    { name: 'March 2026', year: 2026, month: 2 },
    { name: 'April 2026', year: 2026, month: 3 },
    { name: 'May 2026', year: 2026, month: 4 }
  ];

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
      
      {/* Monthly Calendar View */}
      <div className="w-full max-w-7xl">
        {/* First row: September, October, November */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {months.slice(0, 3).map((monthData) => {
            const monthDays = getMonthData(monthData.year, monthData.month);
            
            return (
              <div key={`${monthData.year}-${monthData.month}`} className="bg-gray-800 rounded-lg p-4">
                <h2 className="text-xl font-bold text-center mb-3">{monthData.name}</h2>
                
                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {weekdays.map((day) => (
                    <div key={day} className="text-center text-xs font-semibold text-gray-400 py-1">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {monthDays.map((day, index) => {
                    let bgColor = 'bg-gray-700';
                    let textColor = 'text-gray-400';
                    
                    if (day.isSpecialRed) {
                      bgColor = 'bg-red-600';
                      textColor = 'text-white';
                    } else if (day.isSpecialBlue) {
                      if (day.isOverlapping) {
                        bgColor = 'bg-blue-600/35'; // Same blue with 35% transparency
                      } else {
                        bgColor = 'bg-blue-600'; // Regular blue for current month dates
                      }
                      textColor = 'text-white';
                    } else if (day.isSpecialGreen) {
                      if (day.isOverlapping) {
                        bgColor = 'bg-green-600/35'; // Same green with 35% transparency
                      } else {
                        bgColor = 'bg-green-600'; // Regular green for current month dates
                      }
                      textColor = 'text-white';
                    } else if (day.isCurrentMonth) {
                      bgColor = 'bg-gray-600';
                      textColor = 'text-white';
                    }
                    
                    return (
                      <div
                        key={index}
                        className={`${bgColor} ${textColor} rounded p-1 text-center text-xs min-h-[32px] flex items-center justify-center relative`}
                      >
                        {day.isPast && (
                          <div className="absolute inset-0 flex items-center justify-center text-red-500/70 text-2xl font-bold">
                            😊
                          </div>
                        )}
                        {day.date}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Second row: December, January, February */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {months.slice(3, 6).map((monthData) => {
            const monthDays = getMonthData(monthData.year, monthData.month);
            
            return (
              <div key={`${monthData.year}-${monthData.month}`} className="bg-gray-800 rounded-lg p-4">
                <h2 className="text-xl font-bold text-center mb-3">{monthData.name}</h2>
                
                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {weekdays.map((day) => (
                    <div key={day} className="text-center text-xs font-semibold text-gray-400 py-1">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {monthDays.map((day, index) => {
                    let bgColor = 'bg-gray-700';
                    let textColor = 'text-gray-400';
                    
                    if (day.isSpecialRed) {
                      bgColor = 'bg-red-600';
                      textColor = 'text-white';
                    } else if (day.isSpecialBlue) {
                      if (day.isOverlapping) {
                        bgColor = 'bg-blue-600/35'; // Same blue with 35% transparency
                      } else {
                        bgColor = 'bg-blue-600'; // Regular blue for current month dates
                      }
                      textColor = 'text-white';
                    } else if (day.isSpecialGreen) {
                      if (day.isOverlapping) {
                        bgColor = 'bg-green-600/35'; // Same green with 35% transparency
                      } else {
                        bgColor = 'bg-green-600'; // Regular green for current month dates
                      }
                      textColor = 'text-white';
                    } else if (day.isCurrentMonth) {
                      bgColor = 'bg-gray-600';
                      textColor = 'text-white';
                    }
                    
                    return (
                      <div
                        key={index}
                        className={`${bgColor} ${textColor} rounded p-1 text-center text-xs min-h-[32px] flex items-center justify-center relative`}
                      >
                        {day.isPast && (
                          <div className="absolute inset-0 flex items-center justify-center text-red-500/70 text-2xl font-bold">
                            😊
                          </div>
                        )}
                        {day.date}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Third row: March, April, May */}
        <div className="grid grid-cols-3 gap-6">
          {months.slice(6, 9).map((monthData) => {
            const monthDays = getMonthData(monthData.year, monthData.month);
            
            return (
              <div key={`${monthData.year}-${monthData.month}`} className="bg-gray-800 rounded-lg p-4">
                <h2 className="text-xl font-bold text-center mb-3">{monthData.name}</h2>
                
                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {weekdays.map((day) => (
                    <div key={day} className="text-center text-xs font-semibold text-gray-400 py-1">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {monthDays.map((day, index) => {
                    let bgColor = 'bg-gray-700';
                    let textColor = 'text-gray-400';
                    
                    if (day.isCurrentMonth) {
                      bgColor = 'bg-gray-600';
                      textColor = 'text-white';
                    }
                    
                    // Check for special red highlighting (May 5th)
                    if (day.isSpecialRed) {
                      bgColor = 'bg-red-600';
                      textColor = 'text-white';
                    }
                    // Check for special blue highlighting
                    else if (day.isSpecialBlue) {
                      if (day.isOverlapping) {
                        bgColor = 'bg-blue-600/35';
                      } else {
                        bgColor = 'bg-blue-600';
                      }
                      textColor = 'text-white';
                    }
                    // Check for special green highlighting
                    else if (day.isSpecialGreen) {
                      if (day.isOverlapping) {
                        bgColor = 'bg-green-600/35';
                      } else {
                        bgColor = 'bg-green-600';
                      }
                      textColor = 'text-white';
                    }
                    
                    return (
                      <div
                        key={index}
                        className={`${bgColor} ${textColor} rounded p-1 text-center text-xs min-h-[32px] flex items-center justify-center relative`}
                      >
                        {day.isPast && (
                          <div className="absolute inset-0 flex items-center justify-center text-red-500/35 text-2xl font-bold">
                            😊
                          </div>
                        )}
                        {day.date}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* May 5th Countdown */}
      <div className="mt-12 text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-300">Back to Finland</h2>
        <div className="grid grid-cols-3 gap-16 text-center">
          <div className="flex flex-col items-center">
            <span className="text-9xl font-bold text-gray-300">{mayCountdown.months}</span>
            <span className="text-xl text-gray-300">Months</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-9xl font-bold text-gray-300">{mayCountdown.weeks}</span>
            <span className="text-xl text-gray-300">Weeks</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-9xl font-bold text-gray-300">{mayCountdown.days}</span>
            <span className="text-xl text-gray-300">Days</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Countdown; 