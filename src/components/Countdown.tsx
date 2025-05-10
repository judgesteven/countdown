'use client';

import { useEffect, useState } from 'react';

const Countdown = () => {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    setMounted(true);
    const targetDate = new Date();
    const currentYear = targetDate.getFullYear();
    targetDate.setFullYear(currentYear);
    targetDate.setMonth(5); // June (0-based index)
    targetDate.setDate(7);
    targetDate.setHours(2, 0, 0, 0);

    const startDate = new Date();
    const totalHours = (targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();
      
      if (difference > 0) {
        const hoursElapsed = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60);
        const currentProgress = 100 - ((hoursElapsed / totalHours) * 100);
        setProgress(Math.max(currentProgress, 0));

        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-white">
        <h1 className="text-4xl font-bold mb-8">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 text-white">
      <h1 className="text-4xl font-bold mb-8">Countdown until Finland</h1>
      <div className="w-full max-w-2xl mb-8">
        <div className="w-full bg-gray-700 rounded-full h-4">
          <div 
            className="bg-blue-600 h-4 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-8 text-center">
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
        <div className="flex flex-col">
          <span className="text-6xl font-bold">{timeLeft.seconds}</span>
          <span className="text-xl">Seconds</span>
        </div>
      </div>
    </div>
  );
};

export default Countdown; 