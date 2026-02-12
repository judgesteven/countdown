'use client';

import { useEffect, useState } from 'react';

interface DayData {
  date: string;
  isPast: boolean;
  isSpecialGreen?: boolean;
  isSpecialBlue?: boolean;
  isSpecialRed?: boolean;
  isSpecialPurple?: boolean;
  isSpecialYellow?: boolean;
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

  // Helper function to convert to KSA time (UTC+3)
  const toKSA = (date: Date) => {
    const ksaDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Riyadh' }));
    return ksaDate;
  };

  // Helper function to get start of day in KSA time
  const getStartOfDay = (date: Date) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return toKSA(start);
  };

  // Helper function to get end of day in KSA time
  const getEndOfDay = (date: Date) => {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return toKSA(end);
  };

  // Helper function to get time until next hour
  const getTimeUntilNextHour = () => {
    const now = toKSA(new Date());
    const nextHour = new Date(now);
    nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
    return nextHour.getTime() - now.getTime();
  };

  // Fixed start date: Friday 16th January, 2026 at 08:00 KSA time
  const startTime = new Date('2026-01-16T08:00:00+03:00'); // Friday 16th January at 08:00 KSA time
  // Fixed end date: Friday 30th January, 2026 at 02:00 KSA time
  const endTime = new Date('2026-01-30T02:00:00+03:00'); // Friday 30th January at 02:00 KSA time

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
        (currentDate >= new Date(2025, 11, 19) && currentDate <= new Date(2025, 11, 22)) || // Dec 19 - Dec 22
        (currentDate >= new Date(2025, 11, 30) && currentDate <= new Date(2025, 11, 31)) || // Dec 30 - Dec 31
        (currentDate >= new Date(2026, 0, 5) && currentDate <= new Date(2026, 0, 9)) || // Jan 5 - Jan 9
        (currentDate >= new Date(2026, 0, 30) && currentDate <= new Date(2026, 1, 13)) || // Jan 30 - Feb 13
        (currentDate >= new Date(2026, 1, 27) && currentDate <= new Date(2026, 2, 13)) || // Feb 27 - Mar 13
        (currentDate >= new Date(2026, 3, 3) && currentDate <= new Date(2026, 3, 17)); // Apr 3 - Apr 17
      
      // Check if date is in special blue range
      const isSpecialBlue = 
        (currentDate >= new Date(2025, 8, 21) && currentDate <= new Date(2025, 8, 28)) || // Sep 21 - Sep 28
        (currentDate.getFullYear() === 2026 && currentDate.getMonth() === 1 && currentDate.getDate() === 22) || // Feb 22, 2026
        (currentDate.getFullYear() === 2026 && currentDate.getMonth() === 2 && currentDate.getDate() === 14) || // Mar 14, 2026
        (currentDate >= new Date(2026, 2, 15) && currentDate <= new Date(2026, 2, 21)) || // Mar 15 - Mar 21 (excl. Sun 22, Mon 23)
        (currentDate >= new Date(2026, 4, 24) && currentDate <= new Date(2026, 4, 30)) || // May 24 - May 30
        (currentDate >= new Date(2026, 5, 4) && currentDate <= new Date(2026, 5, 20)); // Jun 4 - Jun 20
      
      // Check if date is in special yellow range
      const isSpecialYellow = 
        (currentDate.getFullYear() === 2026 && currentDate.getMonth() === 0 && currentDate.getDate() === 26) || // Jan 26, 2026
        (currentDate >= new Date(2026, 0, 27) && currentDate <= new Date(2026, 0, 29)); // Jan 27 - Jan 29, 2026
      
      // Check if date is in special red ranges
      const isSpecialRed = 
        (currentDate >= new Date(2025, 11, 23) && currentDate <= new Date(2025, 11, 29)) || // Dec 23 - Dec 29
        (currentDate.getFullYear() === 2026 && currentDate.getMonth() === 0 && currentDate.getDate() === 1) || // Jan 1, 2026
        (currentDate >= new Date(2026, 0, 2) && currentDate <= new Date(2026, 0, 4)); // Jan 2 - Jan 4, 2026
      
      // Check if date is May 5th (special purple highlighting)
      const isSpecialPurple = 
        (currentDate.getFullYear() === 2026 && currentDate.getMonth() === 4 && currentDate.getDate() === 5); // May 5, 2026
      
      // Check if this date appears in multiple months (overlapping)
      const isOverlapping = !isCurrentMonth && (isSpecialGreen || isSpecialBlue || isSpecialRed || isSpecialPurple || isSpecialYellow);
      
      days.push({
        date: currentDate.getDate(),
        isCurrentMonth,
        isPast,
        isInRange,
        isSpecialGreen,
        isSpecialBlue,
        isSpecialRed,
        isSpecialPurple,
        isSpecialYellow,
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
      const now = toKSA(new Date());
      const difference = endTime.getTime() - now.getTime();
      
      // If we're before the start time, progress should be 0
      if (now.getTime() < startTime.getTime()) {
        setProgress(0);
        const timeUntilStart = startTime.getTime() - now.getTime();
        const days = Math.floor(timeUntilStart / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeUntilStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeUntilStart % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft({ days, hours, minutes });
      } else if (difference > 0) {
        // We're between start and end time - calculate progress
        const hoursElapsed = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        const currentProgress = (hoursElapsed / totalHours) * 100;
        setProgress(Math.max(0, Math.min(currentProgress, 100)));

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
        // We're past the end time
        setProgress(100);
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
      }
    };

    const calculateMayCountdown = () => {
      const now = toKSA(new Date());
      const may5th = new Date('2026-05-05T00:00:00+03:00'); // May 5th, 2026 at midnight KSA time
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
    { name: 'December 2025', year: 2025, month: 11 },
    { name: 'January 2026', year: 2026, month: 0 },
    { name: 'February 2026', year: 2026, month: 1 },
    { name: 'March 2026', year: 2026, month: 2 },
    { name: 'April 2026', year: 2026, month: 3 },
    { name: 'May 2026', year: 2026, month: 4 },
    { name: 'June 2026', year: 2026, month: 5 },
    { name: 'July 2026', year: 2026, month: 6 },
    { name: 'August 2026', year: 2026, month: 7 }
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
      <div className="grid grid-cols-3 gap-8 text-center mb-20">
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
        {/* First row: December, January, February - 1 column on mobile, 3 columns on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
                    
                    if (day.isSpecialPurple) {
                      bgColor = 'bg-purple-600';
                      textColor = 'text-white';
                    } else if (day.isSpecialYellow) {
                      if (day.isOverlapping) {
                        bgColor = 'bg-yellow-600/35'; // Same yellow with 35% transparency
                      } else {
                        bgColor = 'bg-yellow-600'; // Regular yellow for current month dates
                      }
                      textColor = 'text-white';
                    } else if (day.isSpecialRed) {
                      if (day.isOverlapping) {
                        bgColor = 'bg-red-600/35'; // Same red with 35% transparency
                      } else {
                        bgColor = 'bg-red-600'; // Regular red for current month dates
                      }
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
        
        {/* Second row: March, April, May - 1 column on mobile, 3 columns on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
                    
                    if (day.isSpecialPurple) {
                      bgColor = 'bg-purple-600';
                      textColor = 'text-white';
                    } else if (day.isSpecialYellow) {
                      if (day.isOverlapping) {
                        bgColor = 'bg-yellow-600/35'; // Same yellow with 35% transparency
                      } else {
                        bgColor = 'bg-yellow-600'; // Regular yellow for current month dates
                      }
                      textColor = 'text-white';
                    } else if (day.isSpecialRed) {
                      if (day.isOverlapping) {
                        bgColor = 'bg-red-600/35'; // Same red with 35% transparency
                      } else {
                        bgColor = 'bg-red-600'; // Regular red for current month dates
                      }
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
        
        {/* Third row: June, July, August - 1 column on mobile, 3 columns on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
                    
                    if (day.isSpecialPurple) {
                      bgColor = 'bg-purple-600';
                      textColor = 'text-white';
                    } else if (day.isSpecialYellow) {
                      if (day.isOverlapping) {
                        bgColor = 'bg-yellow-600/35'; // Same yellow with 35% transparency
                      } else {
                        bgColor = 'bg-yellow-600'; // Regular yellow for current month dates
                      }
                      textColor = 'text-white';
                    } else if (day.isSpecialRed) {
                      if (day.isOverlapping) {
                        bgColor = 'bg-red-600/35'; // Same red with 35% transparency
                      } else {
                        bgColor = 'bg-red-600'; // Regular red for current month dates
                      }
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