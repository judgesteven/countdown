'use client';

import { useEffect, useState } from 'react';

const DaysList = () => {
  const [days, setDays] = useState<string[]>([]);

  useEffect(() => {
    const calculateDays = () => {
      const targetDate = new Date();
      const currentYear = targetDate.getFullYear();
      targetDate.setFullYear(currentYear);
      targetDate.setMonth(5); // June
      targetDate.setDate(7);
      targetDate.setHours(2, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const daysList: string[] = [];
      const currentDate = new Date(today);

      while (currentDate < targetDate) {
        daysList.push(currentDate.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric'
        }));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      setDays(daysList);
    };

    calculateDays();
    // Update at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();

    const timer = setTimeout(() => {
      calculateDays();
      // Set up daily updates
      const dailyTimer = setInterval(calculateDays, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyTimer);
    }, timeUntilMidnight);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full p-6">
      <h2 className="text-2xl font-bold mb-4 text-white text-center">Days Remaining:</h2>
      <div className="bg-gray-800 rounded-lg p-4 max-h-[600px] overflow-y-auto">
        <ul className="space-y-2">
          {days.map((day, index) => (
            <li 
              key={index}
              className="text-white p-2 hover:bg-gray-700 rounded transition-colors"
            >
              {day}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DaysList; 