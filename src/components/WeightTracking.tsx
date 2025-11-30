import { useEffect, useState, useMemo, useCallback } from 'react';

interface WeightEntry {
  date: Date;
  weight: number;
}

interface DayData {
  date: number;
  isCurrentMonth: boolean;
  isPast: boolean;
  dateObj: Date;
  weight?: number;
  isWeightLoss?: boolean;
}

const WeightTracking = () => {
  const [mounted, setMounted] = useState(false);
  const [currentWeight, setCurrentWeight] = useState<number>(90);
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [newWeight, setNewWeight] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const targetWeight = 80;
  const startWeight = 90;
  const goalDate = new Date('2026-06-01T00:00:00+03:00'); // June 1st, 2026 KSA time
  const [startDate, setStartDate] = useState<Date>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('weightTrackingStartDate');
      if (saved) {
        return new Date(saved);
      }
    }
    return new Date(); // Will be converted to KSA in useEffect
  });

  // Helper function to convert to KSA time
  const toKSA = (date: Date) => {
    const ksaDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Riyadh' }));
    return ksaDate;
  };

  useEffect(() => {
    try {
      setMounted(true);
      setError(null);
      
      // Initialize start date if not set
      if (typeof window !== 'undefined') {
        try {
          const savedStartDate = localStorage.getItem('weightTrackingStartDate');
          if (!savedStartDate) {
            const now = toKSA(new Date());
            setStartDate(now);
            localStorage.setItem('weightTrackingStartDate', now.toISOString());
          } else {
            setStartDate(new Date(savedStartDate));
          }
        } catch (error) {
          console.error('Error loading start date:', error);
          const now = toKSA(new Date());
          setStartDate(now);
        }
        
        // Load weight entries from localStorage
        try {
          const savedEntries = localStorage.getItem('weightEntries');
          if (savedEntries) {
            const entries = JSON.parse(savedEntries).map((entry: { date: string; weight: number }) => ({
              date: new Date(entry.date),
              weight: entry.weight
            }));
            setWeightEntries(entries);
            if (entries.length > 0) {
              // Get the most recent weight
              const latest = entries.sort((a: WeightEntry, b: WeightEntry) => 
                b.date.getTime() - a.date.getTime()
              )[0];
              setCurrentWeight(latest.weight);
              
              // Set start date to first entry if earlier than current start date
              const firstEntry = entries.sort((a: WeightEntry, b: WeightEntry) => 
                a.date.getTime() - b.date.getTime()
              )[0];
              const savedStartDate = localStorage.getItem('weightTrackingStartDate');
              const currentStartDate = savedStartDate ? new Date(savedStartDate) : toKSA(new Date());
              if (firstEntry.date.getTime() < currentStartDate.getTime()) {
                setStartDate(firstEntry.date);
                try {
                  localStorage.setItem('weightTrackingStartDate', firstEntry.date.toISOString());
                } catch (error) {
                  console.error('Error saving start date:', error);
                }
              }
            }
          }
        } catch (error) {
          console.error('Error loading weight entries:', error);
          setError('Error loading saved data. Your data is safe in your browser.');
        }
      }
    } catch (error) {
      console.error('Error in useEffect:', error);
      setError('An error occurred. Please refresh the page.');
    }
  }, []);

  // Helper function to compare dates (year, month, day only)
  const isSameDate = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const handleAddWeight = () => {
    try {
      const weight = parseFloat(newWeight);
      if (isNaN(weight) || weight <= 0) {
        alert('Please enter a valid weight');
        return;
      }

      const now = toKSA(new Date());
      
      // Check if there's already an entry for today's date
      const existingEntryIndex = weightEntries.findIndex(entry => isSameDate(entry.date, now));
      
      let updatedEntries: WeightEntry[];
      if (existingEntryIndex >= 0) {
        // Update existing entry for today
        updatedEntries = [...weightEntries];
        updatedEntries[existingEntryIndex] = {
          date: now,
          weight: weight
        };
      } else {
        // Add new entry
        const newEntry: WeightEntry = {
          date: now,
          weight: weight
        };
        updatedEntries = [...weightEntries, newEntry];
      }
      
      setWeightEntries(updatedEntries);
      setCurrentWeight(weight);
      setNewWeight('');

      // Save to localStorage with error handling
      // Note: localStorage persists data in the user's browser, so it will work on Vercel
      // Data is stored client-side and will persist across sessions and deployments
      if (typeof window !== 'undefined') {
        try {
          // Convert dates to ISO strings for storage
          const entriesToSave = updatedEntries.map(entry => ({
            date: entry.date.toISOString(),
            weight: entry.weight
          }));
          localStorage.setItem('weightEntries', JSON.stringify(entriesToSave));
        } catch (error) {
          console.error('Error saving to localStorage:', error);
          // Try to handle quota exceeded error
          if (error instanceof DOMException && error.code === 22) {
            alert('Storage limit reached. Please clear some old entries.');
          } else {
            alert('Error saving weight. Please try again.');
          }
        }
      }
    } catch (error) {
      console.error('Error adding weight:', error);
      alert('An error occurred. Please try again.');
    }
  };

  // Calculate values only when mounted
  const now = mounted ? toKSA(new Date()) : new Date();

  // Calculate monthly increments for time bar
  const months = [];
  if (mounted && startDate) {
    try {
      let currentMonth = new Date(startDate);
      currentMonth.setDate(1); // Start from first of the month
      while (currentMonth <= goalDate) {
        months.push(new Date(currentMonth));
        currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
      }
    } catch (error) {
      console.error('Error calculating months:', error);
    }
  }

  // Calculate values safely
  let weightProgressClamped = 0;
  let timeProgressClamped = 0;
  let remainingWeight = 0;
  let remainingWeightGrams = 0;
  let weeksRemaining = 0;
  let gramsPerWeek = 0;
  let remainingTime = 0;

  if (mounted && startDate) {
    try {
      // Calculate weight progress (0-100%)
      const weightProgress = ((startWeight - currentWeight) / (startWeight - targetWeight)) * 100;
      weightProgressClamped = Math.max(0, Math.min(100, weightProgress));

      // Calculate time progress
      const totalTime = goalDate.getTime() - startDate.getTime();
      const elapsedTime = now.getTime() - startDate.getTime();
      remainingTime = goalDate.getTime() - now.getTime();
      // Time progress shows elapsed time (0% = start, 100% = goal date reached)
      const timeProgress = totalTime > 0 ? (elapsedTime / totalTime) * 100 : 0;
      timeProgressClamped = Math.max(0, Math.min(100, timeProgress));

      // Calculate remaining weight to lose
      remainingWeight = currentWeight - targetWeight;
      remainingWeightGrams = remainingWeight * 1000;

      // Calculate weeks remaining
      weeksRemaining = remainingTime > 0 ? remainingTime / (1000 * 60 * 60 * 24 * 7) : 0;
      gramsPerWeek = weeksRemaining > 0 ? remainingWeightGrams / weeksRemaining : 0;
    } catch (error) {
      console.error('Error calculating progress:', error);
      // Set safe defaults to prevent crashes
      weightProgressClamped = 0;
      timeProgressClamped = 0;
      remainingWeight = currentWeight - targetWeight;
      remainingWeightGrams = remainingWeight * 1000;
      weeksRemaining = 0;
      gramsPerWeek = 0;
      remainingTime = 0;
    }
  }

  // Helper function to get weight for a specific date
  const getWeightForDate = (date: Date): { weight: number; isLoss: boolean } | null => {
    const entry = weightEntries.find(e => isSameDate(e.date, date));
    if (!entry) return null;

    // Find previous entry to check if it's a loss
    const sortedEntries = [...weightEntries].sort((a, b) => a.date.getTime() - b.date.getTime());
    const entryIndex = sortedEntries.findIndex(e => isSameDate(e.date, date));
    if (entryIndex > 0) {
      const prevEntry = sortedEntries[entryIndex - 1];
      const isLoss = entry.weight < prevEntry.weight;
      return { weight: entry.weight, isLoss };
    }
    return { weight: entry.weight, isLoss: false };
  };

  // Helper function to get month data for calendar
  const getMonthData = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday
    
    const days: DayData[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= lastDay || currentDate.getDay() !== 0) {
      const isCurrentMonth = currentDate.getMonth() === month;
      
      const today = new Date();
      const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      const isPast = currentDateOnly < todayDate;
      
      const weightData = getWeightForDate(currentDate);
      
      days.push({
        date: currentDate.getDate(),
        isCurrentMonth,
        isPast,
        dateObj: new Date(currentDate),
        weight: weightData?.weight,
        isWeightLoss: weightData?.isLoss
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-white">
        <h1 className="text-4xl font-bold mb-8">Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-white">
        <h1 className="text-4xl font-bold mb-8">The Road to Health</h1>
        <p className="text-xl text-red-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const calendarMonths = [
    { name: 'November 2025', year: 2025, month: 10 },
    { name: 'December 2025', year: 2025, month: 11 },
    { name: 'January 2026', year: 2026, month: 0 },
    { name: 'February 2026', year: 2026, month: 1 },
    { name: 'March 2026', year: 2026, month: 2 },
    { name: 'April 2026', year: 2026, month: 3 },
    { name: 'May 2026', year: 2026, month: 4 },
    { name: 'June 2026', year: 2026, month: 5 }
  ];

  // Calculate target weight for a specific Saturday (using Nov 29 start at 90.2KG)
  const getTargetWeightForSaturday = (saturdayDate: Date): number | null => {
    if (!mounted) return null;
    
    const startDateForTargets = new Date('2025-11-29T00:00:00+03:00');
    const startWeightForCalculation = 90.2;
    const totalTime = goalDate.getTime() - startDateForTargets.getTime();
    const timeToSaturday = saturdayDate.getTime() - startDateForTargets.getTime();
    
    if (timeToSaturday < 0 || timeToSaturday > totalTime) return null;
    
    const progress = timeToSaturday / totalTime;
    const totalWeightToLose = startWeightForCalculation - targetWeight;
    const weightToLoseBySaturday = progress * totalWeightToLose;
    const targetWeightForSaturday = startWeightForCalculation - weightToLoseBySaturday;
    
    return targetWeightForSaturday;
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 text-white px-4">
      <h1 className="text-4xl font-bold mb-8">The Road to Health</h1>

      {/* Current Weight Display */}
      <div className="text-center mb-8">
        <div className="text-9xl font-bold mb-4">
          {currentWeight.toFixed(1)} <span className="text-4xl text-gray-400">KG</span>
        </div>
        {remainingWeight > 0 && (
          <div className="text-lg text-gray-400 mt-2">
            {gramsPerWeek > 0 ? (
              <>
                {Math.round(gramsPerWeek / 7)}g / day - {gramsPerWeek.toFixed(0)}g / week - {Math.round(gramsPerWeek * 4.33)}g / month
              </>
            ) : (
              <>Time has passed</>
            )}
          </div>
        )}
      </div>

      {/* Weight Progress Bar - 80vw wide */}
      <div className="w-[80vw] mb-8">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400 w-16 text-right">90KG</span>
          <div className="flex-1 bg-gray-700 rounded-full h-6 relative">
            <div
              className="bg-green-600 h-6 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${weightProgressClamped}%` }}
            />
          </div>
          <span className="text-sm text-gray-400 w-16">80KG</span>
        </div>
        {remainingWeight > 0 && (
          <div className="text-center text-xl text-gray-300 mt-2">
            {remainingWeight.toFixed(1)} KG to target ({weightProgressClamped.toFixed(1)}%)
          </div>
        )}
        {remainingWeight <= 0 && (
          <div className="text-center text-xl text-green-400 mt-2">
            Goal Achieved! 🎉
          </div>
        )}
      </div>


      {/* Add Weight Input */}
      <div className="w-full max-w-md mb-8">
        <div className="flex gap-4">
          <input
            type="number"
            step="0.1"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            placeholder="Enter weight (KG)"
            className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 text-lg"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddWeight();
              }
            }}
          />
          <button
            onClick={handleAddWeight}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* Calendar View */}
      <div className="w-full max-w-7xl mt-8">
        {/* First row: November, December, January */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {calendarMonths.slice(0, 3).map((monthData) => {
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
                    const today = new Date();
                    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                    const dayOnly = new Date(day.dateObj.getFullYear(), day.dateObj.getMonth(), day.dateObj.getDate());
                    const isPast = dayOnly < todayOnly;
                    
                    let bgColor = 'bg-gray-700';
                    let textColor = 'text-gray-400';
                    
                    if (day.isCurrentMonth) {
                      bgColor = 'bg-gray-600';
                      textColor = 'text-white';
                    }
                    
                    // Apply subtle transparency to past dates (similar to overlapping dates)
                    if (isPast && day.isCurrentMonth) {
                      bgColor = 'bg-gray-600/35';
                      textColor = 'text-gray-400';
                    } else if (isPast) {
                      bgColor = 'bg-gray-700/35';
                      textColor = 'text-gray-400';
                    }
                    
                    // Only apply colors to Saturdays with weight readings
                    const isSaturday = day.dateObj.getDay() === 6;
                    if (isSaturday && day.weight !== undefined) {
                      const saturdayTarget = getTargetWeightForSaturday(day.dateObj);
                      if (saturdayTarget !== null) {
                        if (day.weight <= saturdayTarget) {
                          // Meets or beats target - green
                          bgColor = 'bg-green-600';
                          textColor = 'text-white';
                        } else {
                          // Above target - red
                          bgColor = 'bg-red-600';
                          textColor = 'text-white';
                        }
                      }
                    }
                    
                    return (
                      <div
                        key={index}
                        className={`${bgColor} ${textColor} rounded p-1 text-center text-xs min-h-[32px] flex flex-col items-center justify-center relative`}
                      >
                        {day.weight === undefined ? (
                          <span>{day.date}</span>
                        ) : (
                          <span className="text-sm font-semibold">{day.weight.toFixed(1)}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Second row: February, March, April */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {calendarMonths.slice(3, 6).map((monthData) => {
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
                    const today = new Date();
                    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                    const dayOnly = new Date(day.dateObj.getFullYear(), day.dateObj.getMonth(), day.dateObj.getDate());
                    const isPast = dayOnly < todayOnly;
                    
                    let bgColor = 'bg-gray-700';
                    let textColor = 'text-gray-400';
                    
                    if (day.isCurrentMonth) {
                      bgColor = 'bg-gray-600';
                      textColor = 'text-white';
                    }
                    
                    // Apply subtle transparency to past dates (similar to overlapping dates)
                    if (isPast && day.isCurrentMonth) {
                      bgColor = 'bg-gray-600/35';
                      textColor = 'text-gray-400';
                    } else if (isPast) {
                      bgColor = 'bg-gray-700/35';
                      textColor = 'text-gray-400';
                    }
                    
                    // Only apply colors to Saturdays with weight readings
                    const isSaturday = day.dateObj.getDay() === 6;
                    if (isSaturday && day.weight !== undefined) {
                      const saturdayTarget = getTargetWeightForSaturday(day.dateObj);
                      if (saturdayTarget !== null) {
                        if (day.weight <= saturdayTarget) {
                          // Meets or beats target - green
                          bgColor = 'bg-green-600';
                          textColor = 'text-white';
                        } else {
                          // Above target - red
                          bgColor = 'bg-red-600';
                          textColor = 'text-white';
                        }
                      }
                    }
                    
                    return (
                      <div
                        key={index}
                        className={`${bgColor} ${textColor} rounded p-1 text-center text-xs min-h-[32px] flex flex-col items-center justify-center relative`}
                      >
                        {day.weight === undefined ? (
                          <span>{day.date}</span>
                        ) : (
                          <span className="text-sm font-semibold">{day.weight.toFixed(1)}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Third row: May, June */}
        <div className="grid grid-cols-3 gap-6">
          {calendarMonths.slice(6, 8).map((monthData) => {
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
                    const today = new Date();
                    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                    const dayOnly = new Date(day.dateObj.getFullYear(), day.dateObj.getMonth(), day.dateObj.getDate());
                    const isPast = dayOnly < todayOnly;
                    
                    let bgColor = 'bg-gray-700';
                    let textColor = 'text-gray-400';
                    
                    if (day.isCurrentMonth) {
                      bgColor = 'bg-gray-600';
                      textColor = 'text-white';
                    }
                    
                    // Apply subtle transparency to past dates (similar to overlapping dates)
                    if (isPast && day.isCurrentMonth) {
                      bgColor = 'bg-gray-600/35';
                      textColor = 'text-gray-400';
                    } else if (isPast) {
                      bgColor = 'bg-gray-700/35';
                      textColor = 'text-gray-400';
                    }
                    
                    // Only apply colors to Saturdays with weight readings
                    const isSaturday = day.dateObj.getDay() === 6;
                    if (isSaturday && day.weight !== undefined) {
                      const saturdayTarget = getTargetWeightForSaturday(day.dateObj);
                      if (saturdayTarget !== null) {
                        if (day.weight <= saturdayTarget) {
                          // Meets or beats target - green
                          bgColor = 'bg-green-600';
                          textColor = 'text-white';
                        } else {
                          // Above target - red
                          bgColor = 'bg-red-600';
                          textColor = 'text-white';
                        }
                      }
                    }
                    
                    return (
                      <div
                        key={index}
                        className={`${bgColor} ${textColor} rounded p-1 text-center text-xs min-h-[32px] flex flex-col items-center justify-center relative`}
                      >
                        {day.weight === undefined ? (
                          <span>{day.date}</span>
                        ) : (
                          <span className="text-sm font-semibold">{day.weight.toFixed(1)}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>


      {/* Saturday Target Weights */}
      <div className="w-full max-w-md mt-8">
        <h2 className="text-xl font-semibold mb-4">Saturday Targets</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {(() => {
            const saturdays: { date: Date; targetWeight: number }[] = [];
            const startDateForTargets = new Date('2025-11-29T00:00:00+03:00'); // November 29th as starting date
            const endDate = new Date('2026-05-30T00:00:00+03:00'); // May 30th
            
            // Start with November 29th (today/starting date) at 90.2KG
            saturdays.push({
              date: new Date(startDateForTargets),
              targetWeight: 90.2
            });
            
            // Find next Saturday after Nov 29th
            let currentDate = new Date(startDateForTargets);
            currentDate.setDate(currentDate.getDate() + 7); // Move to next Saturday
            
            // Calculate target weights for each Saturday
            // Starting from Nov 29th at 90.2KG, need to reach 80KG by June 1st
            const startWeightForCalculation = 90.2;
            const totalTime = goalDate.getTime() - startDateForTargets.getTime();
            const totalWeightToLose = startWeightForCalculation - targetWeight;
            
            while (currentDate <= endDate) {
              const timeToSaturday = currentDate.getTime() - startDateForTargets.getTime();
              if (timeToSaturday > 0 && timeToSaturday <= totalTime) {
                const progress = timeToSaturday / totalTime;
                const weightToLoseBySaturday = progress * totalWeightToLose;
                const targetWeightForSaturday = startWeightForCalculation - weightToLoseBySaturday;
                
                saturdays.push({
                  date: new Date(currentDate),
                  targetWeight: targetWeightForSaturday
                });
              }
              
              // Move to next Saturday
              currentDate.setDate(currentDate.getDate() + 7);
            }
            
            // Add May 30th if it's not already included (it might be a Saturday or we need to add it anyway)
            const may30 = new Date('2026-05-30T00:00:00+03:00');
            const may30Time = may30.getTime() - startDateForTargets.getTime();
            if (may30Time > 0 && may30Time <= totalTime) {
              const may30Progress = may30Time / totalTime;
              const weightToLoseByMay30 = may30Progress * totalWeightToLose;
              const targetWeightForMay30 = startWeightForCalculation - weightToLoseByMay30;
              
              // Check if May 30th is already in the list
              const may30Exists = saturdays.some(s => 
                s.date.getFullYear() === may30.getFullYear() &&
                s.date.getMonth() === may30.getMonth() &&
                s.date.getDate() === may30.getDate()
              );
              
              if (!may30Exists) {
                saturdays.push({
                  date: may30,
                  targetWeight: targetWeightForMay30
                });
              }
            }
            
            return saturdays.map((saturday, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-gray-800 rounded-lg"
              >
                <span className="text-gray-400">
                  {saturday.date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
                <span className="text-lg font-semibold">{saturday.targetWeight.toFixed(1)} KG</span>
              </div>
            ));
          })()}
        </div>
      </div>
    </div>
  );
};

export default WeightTracking;
