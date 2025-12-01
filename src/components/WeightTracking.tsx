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
  const [lastSaturdayWithReading, setLastSaturdayWithReading] = useState<Date | null>(null);
  const [recalculationBaseWeight, setRecalculationBaseWeight] = useState<number>(90.2);
  const [recalculationBaseDate, setRecalculationBaseDate] = useState<Date>(() => new Date('2025-11-29T00:00:00+03:00'));

  const targetWeight = 80;
  const startWeight = 90.2; // Starting weight
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
        
        // Load recalculation base from localStorage
        try {
          const savedBaseWeight = localStorage.getItem('recalculationBaseWeight');
          const savedBaseDate = localStorage.getItem('recalculationBaseDate');
          const savedLastSaturday = localStorage.getItem('lastSaturdayWithReading');
          
          if (savedBaseWeight && savedBaseDate) {
            setRecalculationBaseWeight(parseFloat(savedBaseWeight));
            setRecalculationBaseDate(new Date(savedBaseDate));
          } else {
            // Initialize with default values
            const defaultBaseDate = toKSA(new Date('2025-11-29T00:00:00+03:00'));
            setRecalculationBaseWeight(90.2);
            setRecalculationBaseDate(defaultBaseDate);
            localStorage.setItem('recalculationBaseWeight', '90.2');
            localStorage.setItem('recalculationBaseDate', defaultBaseDate.toISOString());
          }
          
          if (savedLastSaturday) {
            setLastSaturdayWithReading(new Date(savedLastSaturday));
          }
        } catch (error) {
          console.error('Error loading recalculation base:', error);
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
      const isSaturday = now.getDay() === 6;
      
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

      // Check if we need to recalculate (Saturday reading or missed Saturday)
      let newBaseWeight = recalculationBaseWeight;
      let newBaseDate = recalculationBaseDate;
      let newLastSaturday = lastSaturdayWithReading;
      let shouldRecalculate = false;
      
      if (isSaturday) {
        // It's a Saturday - update the recalculation base
        newBaseWeight = weight;
        newBaseDate = now;
        newLastSaturday = now;
        shouldRecalculate = true;
        setRecalculationBaseWeight(weight);
        setRecalculationBaseDate(now);
        setLastSaturdayWithReading(now);
      } else {
        // Check if last Saturday had a reading
        if (!lastSaturdayWithReading) {
          // No Saturday reading yet - recalculate on first reading
          newBaseWeight = weight;
          newBaseDate = now;
          shouldRecalculate = true;
          setRecalculationBaseWeight(weight);
          setRecalculationBaseDate(now);
        } else {
          // Find the most recent Saturday
          const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const lastSaturdayOnly = new Date(lastSaturdayWithReading.getFullYear(), lastSaturdayWithReading.getMonth(), lastSaturdayWithReading.getDate());
          const daysSinceLastSaturday = Math.floor((todayOnly.getTime() - lastSaturdayOnly.getTime()) / (1000 * 60 * 60 * 24));
          
          // If more than 7 days since last Saturday, we missed a Saturday
          if (daysSinceLastSaturday > 7) {
            // Find the most recent Saturday before today
            let recentSaturday = new Date(now);
            while (recentSaturday.getDay() !== 6) {
              recentSaturday.setDate(recentSaturday.getDate() - 1);
            }
            recentSaturday.setHours(0, 0, 0, 0);
            
            // Check if there's a reading for that Saturday
            const saturdayEntry = updatedEntries.find(entry => isSameDate(entry.date, recentSaturday));
            if (!saturdayEntry) {
              // Missed Saturday - recalculate based on current weight
              newBaseWeight = weight;
              newBaseDate = now;
              shouldRecalculate = true;
              setRecalculationBaseWeight(weight);
              setRecalculationBaseDate(now);
            }
          }
        }
      }

      // Save to localStorage with error handling
      if (typeof window !== 'undefined') {
        try {
          // Convert dates to ISO strings for storage
          const entriesToSave = updatedEntries.map(entry => ({
            date: entry.date.toISOString(),
            weight: entry.weight
          }));
          localStorage.setItem('weightEntries', JSON.stringify(entriesToSave));
          
          // Save recalculation base if updated
          if (shouldRecalculate) {
            localStorage.setItem('recalculationBaseWeight', newBaseWeight.toString());
            localStorage.setItem('recalculationBaseDate', newBaseDate.toISOString());
            if (isSaturday) {
              localStorage.setItem('lastSaturdayWithReading', now.toISOString());
            }
          }
        } catch (error) {
          console.error('Error saving to localStorage:', error);
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

  // Calculate values safely using useMemo to recalculate when base changes
  const {
    weightProgressClamped,
    timeProgressClamped,
    remainingWeight,
    remainingWeightGrams,
    weeksRemaining,
    gramsPerWeek,
    gramsPerDay,
    gramsPerMonth,
    remainingTime
  } = useMemo(() => {
    let weightProgressClamped = 0;
    let timeProgressClamped = 0;
    let remainingWeight = 0;
    let remainingWeightGrams = 0;
    let weeksRemaining = 0;
    let gramsPerWeek = 0;
    let gramsPerDay = 0;
    let gramsPerMonth = 0;
    let remainingTime = 0;

    if (mounted && startDate) {
      try {
        // Use recalculation base for calculations
        const baseWeight = recalculationBaseWeight;
        const baseDate = recalculationBaseDate;
        
        // Calculate weight progress (0-100%) based on original start weight
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

        // Calculate weeks remaining from recalculation base date
        const remainingTimeFromBase = goalDate.getTime() - Math.max(baseDate.getTime(), now.getTime());
        weeksRemaining = remainingTimeFromBase > 0 ? remainingTimeFromBase / (1000 * 60 * 60 * 24 * 7) : 0;
        
        // Calculate weight to lose from recalculation base
        const remainingWeightFromBase = currentWeight - targetWeight;
        const remainingWeightGramsFromBase = remainingWeightFromBase * 1000;
        
        gramsPerWeek = weeksRemaining > 0 ? remainingWeightGramsFromBase / weeksRemaining : 0;
        
        // Calculate daily and monthly rates
        gramsPerDay = gramsPerWeek / 7;
        gramsPerMonth = gramsPerWeek * (365.25 / 12 / 7); // Approximate monthly
      } catch (error) {
        console.error('Error calculating progress:', error);
        // Set safe defaults to prevent crashes
        weightProgressClamped = 0;
        timeProgressClamped = 0;
        remainingWeight = currentWeight - targetWeight;
        remainingWeightGrams = remainingWeight * 1000;
        weeksRemaining = 0;
        gramsPerWeek = 0;
        gramsPerDay = 0;
        gramsPerMonth = 0;
        remainingTime = 0;
      }
    }
    
    return {
      weightProgressClamped,
      timeProgressClamped,
      remainingWeight,
      remainingWeightGrams,
      weeksRemaining,
      gramsPerWeek,
      gramsPerDay,
      gramsPerMonth,
      remainingTime
    };
  }, [mounted, startDate, currentWeight, recalculationBaseWeight, recalculationBaseDate, now, startWeight, targetWeight, goalDate]);

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

  // Calculate target weight for a specific Saturday
  // Prefers recalculated target if available, falls back to original target
  const getTargetWeightForSaturday = (saturdayDate: Date): number | null => {
    if (!mounted) return null;
    
    const originalStartDate = new Date('2025-11-29T00:00:00+03:00'); // Nov 29, 2025
    const originalStartWeight = 90.2; // Starting weight
    
    // Try recalculated target first (if Saturday is on or after recalculation base date)
    const baseWeight = recalculationBaseWeight;
    const baseDate = recalculationBaseDate;
    const recalculatedTotalTime = goalDate.getTime() - baseDate.getTime();
    const timeToSaturdayFromBase = saturdayDate.getTime() - baseDate.getTime();
    
    if (timeToSaturdayFromBase >= 0 && timeToSaturdayFromBase <= recalculatedTotalTime) {
      const progress = recalculatedTotalTime > 0 ? timeToSaturdayFromBase / recalculatedTotalTime : 0;
      const totalWeightToLose = baseWeight - targetWeight;
      const weightToLoseBySaturday = progress * totalWeightToLose;
      const recalculatedTarget = baseWeight - weightToLoseBySaturday;
      return recalculatedTarget;
    }
    
    // Fall back to original target
    const totalTime = goalDate.getTime() - originalStartDate.getTime();
    const timeToSaturday = saturdayDate.getTime() - originalStartDate.getTime();
    
    if (timeToSaturday < 0 || timeToSaturday > totalTime) return null;
    
    const progress = totalTime > 0 ? timeToSaturday / totalTime : 0;
    const totalWeightToLose = originalStartWeight - targetWeight;
    const weightToLoseBySaturday = progress * totalWeightToLose;
    const originalTarget = originalStartWeight - weightToLoseBySaturday;
    
    return originalTarget;
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
                {Math.round(gramsPerDay)}g / day - {gramsPerWeek.toFixed(0)}g / week - {Math.round(gramsPerMonth)}g / month
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
                    
                    // Check for Saturday colors FIRST (before past date transparency)
                    const isSaturday = day.dateObj.getDay() === 6;
                    if (isSaturday && day.weight !== undefined) {
                      const saturdayTarget = getTargetWeightForSaturday(day.dateObj);
                      if (saturdayTarget !== null) {
                        if (day.weight <= saturdayTarget) {
                          // Meets or beats target - green (keep color even if past)
                          bgColor = 'bg-green-600';
                          textColor = 'text-white';
                        } else {
                          // Above target - red (keep color even if past)
                          bgColor = 'bg-red-600';
                          textColor = 'text-white';
                        }
                      }
                    } else {
                      // Only apply default colors if not a Saturday with reading
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
                    
                    // Check for Saturday colors FIRST (before past date transparency)
                    const isSaturday = day.dateObj.getDay() === 6;
                    if (isSaturday && day.weight !== undefined) {
                      const saturdayTarget = getTargetWeightForSaturday(day.dateObj);
                      if (saturdayTarget !== null) {
                        if (day.weight <= saturdayTarget) {
                          // Meets or beats target - green (keep color even if past)
                          bgColor = 'bg-green-600';
                          textColor = 'text-white';
                        } else {
                          // Above target - red (keep color even if past)
                          bgColor = 'bg-red-600';
                          textColor = 'text-white';
                        }
                      }
                    } else {
                      // Only apply default colors if not a Saturday with reading
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
                    
                    // Check for Saturday colors FIRST (before past date transparency)
                    const isSaturday = day.dateObj.getDay() === 6;
                    if (isSaturday && day.weight !== undefined) {
                      const saturdayTarget = getTargetWeightForSaturday(day.dateObj);
                      if (saturdayTarget !== null) {
                        if (day.weight <= saturdayTarget) {
                          // Meets or beats target - green (keep color even if past)
                          bgColor = 'bg-green-600';
                          textColor = 'text-white';
                        } else {
                          // Above target - red (keep color even if past)
                          bgColor = 'bg-red-600';
                          textColor = 'text-white';
                        }
                      }
                    } else {
                      // Only apply default colors if not a Saturday with reading
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
      <div className="w-full max-w-2xl mt-8">
        <h2 className="text-xl font-semibold mb-4">Saturday Targets</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {(() => {
            const saturdays: { date: Date; originalTarget: number; recalculatedTarget: number | null }[] = [];
            
            // Original start date and weight
            const originalStartDate = new Date('2025-11-29T00:00:00+03:00'); // Nov 29, 2025
            const originalStartWeight = 90.2; // Starting weight
            
            // Recalculation base (current)
            const baseWeight = recalculationBaseWeight;
            const baseDate = recalculationBaseDate;
            
            const endDate = new Date('2026-05-30T00:00:00+03:00'); // May 30th
            
            // Calculate original targets
            const originalTotalTime = goalDate.getTime() - originalStartDate.getTime();
            const originalTotalWeightToLose = originalStartWeight - targetWeight;
            
            // Calculate recalculated targets
            const recalculatedTotalTime = goalDate.getTime() - baseDate.getTime();
            const recalculatedTotalWeightToLose = baseWeight - targetWeight;
            
            // Start with original start date (Nov 29th) - add it first
            const timeToStart = originalStartDate.getTime() - originalStartDate.getTime();
            let recalculatedTargetStart: number | null = null;
            const timeToStartFromBase = originalStartDate.getTime() - baseDate.getTime();
            
            if (timeToStartFromBase >= 0 && timeToStartFromBase <= recalculatedTotalTime) {
              const progress = recalculatedTotalTime > 0 ? timeToStartFromBase / recalculatedTotalTime : 0;
              const weightToLoseByStart = progress * recalculatedTotalWeightToLose;
              recalculatedTargetStart = baseWeight - weightToLoseByStart;
            }
            
            saturdays.push({
              date: new Date(originalStartDate),
              originalTarget: originalStartWeight,
              recalculatedTarget: recalculatedTargetStart
            });
            
            // Find next Saturday after original start date
            let currentDate = new Date(originalStartDate);
            currentDate.setDate(currentDate.getDate() + 7); // Move to next Saturday
            
            while (currentDate <= endDate) {
              // Calculate original target
              const timeToSaturday = currentDate.getTime() - originalStartDate.getTime();
              let originalTarget = originalStartWeight;
              
              if (timeToSaturday > 0 && timeToSaturday <= originalTotalTime) {
                const progress = originalTotalTime > 0 ? timeToSaturday / originalTotalTime : 0;
                const weightToLoseBySaturday = progress * originalTotalWeightToLose;
                originalTarget = originalStartWeight - weightToLoseBySaturday;
              }
              
              // Calculate recalculated target (only if Saturday is on or after recalculation base date)
              let recalculatedTarget: number | null = null;
              const timeToSaturdayFromBase = currentDate.getTime() - baseDate.getTime();
              
              if (timeToSaturdayFromBase >= 0 && timeToSaturdayFromBase <= recalculatedTotalTime) {
                const progress = recalculatedTotalTime > 0 ? timeToSaturdayFromBase / recalculatedTotalTime : 0;
                const weightToLoseBySaturday = progress * recalculatedTotalWeightToLose;
                recalculatedTarget = baseWeight - weightToLoseBySaturday;
              }
              
              saturdays.push({
                date: new Date(currentDate),
                originalTarget,
                recalculatedTarget
              });
              
              // Move to next Saturday
              currentDate.setDate(currentDate.getDate() + 7);
            }
            
            // Add May 30th if it's not already included
            const may30 = new Date('2026-05-30T00:00:00+03:00');
            const may30Exists = saturdays.some(s => 
              s.date.getFullYear() === may30.getFullYear() &&
              s.date.getMonth() === may30.getMonth() &&
              s.date.getDate() === may30.getDate()
            );
            
            if (!may30Exists) {
              const timeToMay30 = may30.getTime() - originalStartDate.getTime();
              let originalTarget = originalStartWeight;
              
              if (timeToMay30 > 0 && timeToMay30 <= originalTotalTime) {
                const progress = originalTotalTime > 0 ? timeToMay30 / originalTotalTime : 0;
                const weightToLoseByMay30 = progress * originalTotalWeightToLose;
                originalTarget = originalStartWeight - weightToLoseByMay30;
              }
              
              const timeToMay30FromBase = may30.getTime() - baseDate.getTime();
              let recalculatedTarget: number | null = null;
              
              if (timeToMay30FromBase >= 0 && timeToMay30FromBase <= recalculatedTotalTime) {
                const progress = recalculatedTotalTime > 0 ? timeToMay30FromBase / recalculatedTotalTime : 0;
                const weightToLoseByMay30 = progress * recalculatedTotalWeightToLose;
                recalculatedTarget = baseWeight - weightToLoseByMay30;
              }
              
              saturdays.push({
                date: may30,
                originalTarget,
                recalculatedTarget
              });
            }
            
            return (
              <>
                {/* Header */}
                <div className="grid grid-cols-3 gap-4 p-3 bg-gray-700 rounded-lg mb-2 sticky top-0">
                  <span className="text-sm font-semibold text-gray-300">Date</span>
                  <span className="text-sm font-semibold text-gray-300 text-center">Original Target</span>
                  <span className="text-sm font-semibold text-gray-300 text-center">Recalculated Target</span>
                </div>
                {/* Rows */}
                {saturdays.map((saturday, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-3 gap-4 items-center p-3 bg-gray-800 rounded-lg"
                  >
                    <span className="text-gray-400">
                      {saturday.date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    <span className="text-lg font-semibold text-center">{saturday.originalTarget.toFixed(1)} KG</span>
                    <span className={`text-lg font-semibold text-center ${saturday.recalculatedTarget !== null ? 'text-blue-400' : 'text-gray-500'}`}>
                      {saturday.recalculatedTarget !== null ? `${saturday.recalculatedTarget.toFixed(1)} KG` : '—'}
                    </span>
                  </div>
                ))}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default WeightTracking;
