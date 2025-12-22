import { useEffect, useState, useMemo, useCallback } from 'react';

interface ActivityEntry {
  date: Date;
  distance: number; // in km
  time: number; // in minutes
  pace: number; // in min/km
  avgHeartRate: number; // bpm
  maxHeartRate: number; // bpm
  vo2Max: number;
}

interface WeightEntry {
  date: Date;
  weight: number;
}

interface DayData {
  date: number;
  isCurrentMonth: boolean;
  isPast: boolean;
  dateObj: Date;
  activity?: ActivityEntry;
  weight?: number;
}

const WeightTracking = () => {
  const [mounted, setMounted] = useState(false);
  const [activityEntries, setActivityEntries] = useState<ActivityEntry[]>([]);
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [currentWeight, setCurrentWeight] = useState<number>(90);
  const [newActivity, setNewActivity] = useState({
    distance: '',
    time: '',
    pace: '',
    avgHeartRate: '',
    maxHeartRate: '',
    vo2Max: ''
  });
  const [newWeight, setNewWeight] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const targetWeight = 80;
  const startWeight = 90;

  // Helper function to convert to KSA time
  const toKSA = (date: Date) => {
    const ksaDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Riyadh' }));
    return ksaDate;
  };

  useEffect(() => {
    try {
      setMounted(true);
      setError(null);
      
          // Load activity entries from localStorage
          if (typeof window !== 'undefined') {
            try {
              const savedActivityEntries = localStorage.getItem('activityEntries');
              if (savedActivityEntries) {
                const entries = JSON.parse(savedActivityEntries).map((entry: any) => ({
                  date: new Date(entry.date),
                  distance: entry.distance,
                  time: entry.time,
                  pace: entry.pace,
                  avgHeartRate: entry.avgHeartRate,
                  maxHeartRate: entry.maxHeartRate,
                  vo2Max: entry.vo2Max
                }));
                setActivityEntries(entries);
              }
              
              // Load weight entries from localStorage
              const savedWeightEntries = localStorage.getItem('weightEntries');
              if (savedWeightEntries) {
                const weightEntries = JSON.parse(savedWeightEntries).map((entry: any) => ({
                  date: new Date(entry.date),
                  weight: entry.weight
                }));
                setWeightEntries(weightEntries);
                if (weightEntries.length > 0) {
                  // Get the most recent weight
                  const latest = weightEntries.sort((a: WeightEntry, b: WeightEntry) => 
                    b.date.getTime() - a.date.getTime()
                  )[0];
                  setCurrentWeight(latest.weight);
                }
              }
            } catch (error) {
              console.error('Error loading entries:', error);
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
      if (typeof window !== 'undefined') {
        try {
          const entriesToSave = updatedEntries.map(entry => ({
            date: entry.date.toISOString(),
            weight: entry.weight
          }));
          localStorage.setItem('weightEntries', JSON.stringify(entriesToSave));
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

  // Helper function to get weight for a specific date
  const getWeightForDate = (date: Date): number | null => {
    const entry = weightEntries.find(e => isSameDate(e.date, date));
    return entry ? entry.weight : null;
  };

  const handleAddActivity = () => {
    try {
      const distance = parseFloat(newActivity.distance);
      const time = parseFloat(newActivity.time);
      const pace = parseFloat(newActivity.pace);
      const avgHeartRate = parseFloat(newActivity.avgHeartRate);
      const maxHeartRate = parseFloat(newActivity.maxHeartRate);
      const vo2Max = parseFloat(newActivity.vo2Max);

      if (isNaN(distance) || distance <= 0) {
        alert('Please enter a valid distance');
        return;
      }
      if (isNaN(time) || time <= 0) {
        alert('Please enter a valid time');
        return;
      }

      const now = toKSA(new Date());
      
      // Check if there's already an entry for today's date
      const existingEntryIndex = activityEntries.findIndex(entry => isSameDate(entry.date, now));
      
      let updatedEntries: ActivityEntry[];
      const newEntry: ActivityEntry = {
        date: now,
        distance: distance,
        time: time,
        pace: isNaN(pace) ? time / distance : pace,
        avgHeartRate: isNaN(avgHeartRate) ? 0 : avgHeartRate,
        maxHeartRate: isNaN(maxHeartRate) ? 0 : maxHeartRate,
        vo2Max: isNaN(vo2Max) ? 0 : vo2Max
      };

      if (existingEntryIndex >= 0) {
        // Update existing entry for today
        updatedEntries = [...activityEntries];
        updatedEntries[existingEntryIndex] = newEntry;
      } else {
        // Add new entry
        updatedEntries = [...activityEntries, newEntry];
      }
      
      setActivityEntries(updatedEntries);
      setNewActivity({
        distance: '',
        time: '',
        pace: '',
        avgHeartRate: '',
        maxHeartRate: '',
        vo2Max: ''
      });

      // Save to localStorage with error handling
      if (typeof window !== 'undefined') {
        try {
          // Convert dates to ISO strings for storage
          const entriesToSave = updatedEntries.map(entry => ({
            date: entry.date.toISOString(),
            distance: entry.distance,
            time: entry.time,
            pace: entry.pace,
            avgHeartRate: entry.avgHeartRate,
            maxHeartRate: entry.maxHeartRate,
            vo2Max: entry.vo2Max
          }));
          localStorage.setItem('activityEntries', JSON.stringify(entriesToSave));
        } catch (error) {
          console.error('Error saving to localStorage:', error);
          if (error instanceof DOMException && error.code === 22) {
            alert('Storage limit reached. Please clear some old entries.');
          } else {
            alert('Error saving activity. Please try again.');
          }
        }
      }
    } catch (error) {
      console.error('Error adding activity:', error);
      alert('An error occurred. Please try again.');
    }
  };

  // Calculate weight progress
  const weightProgress = useMemo(() => {
    const remainingWeight = currentWeight - targetWeight;
    const totalWeightToLose = startWeight - targetWeight;
    const progress = totalWeightToLose > 0 ? ((startWeight - currentWeight) / totalWeightToLose) * 100 : 0;
    return {
      progress: Math.max(0, Math.min(100, progress)),
      remainingWeight: remainingWeight
    };
  }, [currentWeight, targetWeight, startWeight]);

  // Calculate total activity summary
  const totalSummary = useMemo(() => {
    if (activityEntries.length === 0) {
      return {
        totalDistance: 0,
        totalTime: 0,
        totalRuns: 0,
        avgPace: 0,
        avgHeartRate: 0,
        maxHeartRate: 0,
        avgVo2Max: 0
      };
    }

    const totalDistance = activityEntries.reduce((sum, entry) => sum + entry.distance, 0);
    const totalTime = activityEntries.reduce((sum, entry) => sum + entry.time, 0);
    const totalRuns = activityEntries.length;
    const avgPace = totalDistance > 0 ? totalTime / totalDistance : 0;
    const avgHeartRate = activityEntries.reduce((sum, entry) => sum + entry.avgHeartRate, 0) / totalRuns;
    const maxHeartRate = Math.max(...activityEntries.map(e => e.maxHeartRate));
    const avgVo2Max = activityEntries.reduce((sum, entry) => sum + entry.vo2Max, 0) / totalRuns;

    return {
      totalDistance,
      totalTime,
      totalRuns,
      avgPace,
      avgHeartRate,
      maxHeartRate,
      avgVo2Max
    };
  }, [activityEntries]);

  // Helper function to get activity for a specific date
  const getActivityForDate = (date: Date): ActivityEntry | null => {
    return activityEntries.find(e => isSameDate(e.date, date)) || null;
  };

  // Helper function to get monthly summary
  const getMonthlySummary = (year: number, month: number) => {
    const monthEntries = activityEntries.filter(entry => {
      const entryDate = entry.date;
      return entryDate.getFullYear() === year && entryDate.getMonth() === month;
    });

    if (monthEntries.length === 0) {
      return {
        totalDistance: 0,
        totalTime: 0,
        totalRuns: 0,
        avgPace: 0,
        avgHeartRate: 0,
        maxHeartRate: 0,
        avgVo2Max: 0
      };
    }

    const totalDistance = monthEntries.reduce((sum, entry) => sum + entry.distance, 0);
    const totalTime = monthEntries.reduce((sum, entry) => sum + entry.time, 0);
    const totalRuns = monthEntries.length;
    const avgPace = totalDistance > 0 ? totalTime / totalDistance : 0;
    const avgHeartRate = monthEntries.reduce((sum, entry) => sum + entry.avgHeartRate, 0) / totalRuns;
    const maxHeartRate = Math.max(...monthEntries.map(e => e.maxHeartRate));
    const avgVo2Max = monthEntries.reduce((sum, entry) => sum + entry.vo2Max, 0) / totalRuns;

    return {
      totalDistance,
      totalTime,
      totalRuns,
      avgPace,
      avgHeartRate,
      maxHeartRate,
      avgVo2Max
    };
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
      
      const activityData = getActivityForDate(currentDate);
      const weightData = getWeightForDate(currentDate);
      
      days.push({
        date: currentDate.getDate(),
        isCurrentMonth,
        isPast,
        dateObj: new Date(currentDate),
        activity: activityData || undefined,
        weight: weightData || undefined
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
        <h1 className="text-4xl font-bold mb-8">Activity</h1>
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
    { name: 'December 2025', year: 2025, month: 11 },
    { name: 'January 2026', year: 2026, month: 0 },
    { name: 'February 2026', year: 2026, month: 1 },
    { name: 'March 2026', year: 2026, month: 2 },
    { name: 'April 2026', year: 2026, month: 3 },
    { name: 'May 2026', year: 2026, month: 4 },
    { name: 'June 2026', year: 2026, month: 5 }
  ];




  return (
    <div className="flex flex-col items-center justify-center py-12 text-white px-4">
      <h1 className="text-4xl font-bold mb-8">Activity</h1>

      {/* Total Summary Card */}
      <div className="w-full max-w-6xl mb-8 bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Total Activity</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">{totalSummary.totalDistance.toFixed(1)}</div>
            <div className="text-sm text-gray-400 mt-1">Total Distance (km)</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">{Math.floor(totalSummary.totalTime / 60)}h {Math.floor(totalSummary.totalTime % 60)}m</div>
            <div className="text-sm text-gray-400 mt-1">Total Time</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">{totalSummary.totalRuns}</div>
            <div className="text-sm text-gray-400 mt-1">Total Runs</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400">{totalSummary.avgPace > 0 ? totalSummary.avgPace.toFixed(2) : '0.00'}</div>
            <div className="text-sm text-gray-400 mt-1">Avg Pace (min/km)</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400">{totalSummary.avgHeartRate > 0 ? Math.round(totalSummary.avgHeartRate) : '0'}</div>
            <div className="text-sm text-gray-400 mt-1">Avg Heart Rate (bpm)</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-400">{totalSummary.maxHeartRate > 0 ? Math.round(totalSummary.maxHeartRate) : '0'}</div>
            <div className="text-sm text-gray-400 mt-1">Max Heart Rate (bpm)</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-400">{totalSummary.avgVo2Max > 0 ? totalSummary.avgVo2Max.toFixed(1) : '0.0'}</div>
            <div className="text-sm text-gray-400 mt-1">Avg VO2 Max</div>
          </div>
        </div>
      </div>

      {/* Add Activity Input */}
      <div className="w-full max-w-4xl mb-8 bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Add Activity</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Distance (km)</label>
            <input
              type="number"
              step="0.1"
              value={newActivity.distance}
              onChange={(e) => setNewActivity({ ...newActivity, distance: e.target.value })}
              placeholder="0.0"
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Time (minutes)</label>
            <input
              type="number"
              step="0.1"
              value={newActivity.time}
              onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
              placeholder="0"
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Pace (min/km)</label>
            <input
              type="number"
              step="0.1"
              value={newActivity.pace}
              onChange={(e) => setNewActivity({ ...newActivity, pace: e.target.value })}
              placeholder="Auto"
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Avg Heart Rate (bpm)</label>
            <input
              type="number"
              step="1"
              value={newActivity.avgHeartRate}
              onChange={(e) => setNewActivity({ ...newActivity, avgHeartRate: e.target.value })}
              placeholder="0"
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Max Heart Rate (bpm)</label>
            <input
              type="number"
              step="1"
              value={newActivity.maxHeartRate}
              onChange={(e) => setNewActivity({ ...newActivity, maxHeartRate: e.target.value })}
              placeholder="0"
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">VO2 Max</label>
            <input
              type="number"
              step="0.1"
              value={newActivity.vo2Max}
              onChange={(e) => setNewActivity({ ...newActivity, vo2Max: e.target.value })}
              placeholder="0.0"
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <button
          onClick={handleAddActivity}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          Add Activity
        </button>
      </div>

      {/* Weight Tracking Section */}
      <div className="w-full max-w-6xl mt-8">
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Weight Tracking</h2>
          
          {/* Weight Progress Bar */}
          <div className="w-full mb-6">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-sm text-gray-400 w-16 text-right">{startWeight}KG</span>
              <div className="flex-1 bg-gray-700 rounded-full h-6 relative">
                <div
                  className="bg-green-600 h-6 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${weightProgress.progress}%` }}
                />
              </div>
              <span className="text-sm text-gray-400 w-16">{targetWeight}KG</span>
            </div>
            <div className="text-center text-lg text-gray-300">
              Current: {currentWeight.toFixed(1)} KG
              {weightProgress.remainingWeight > 0 && (
                <span className="ml-4">
                  ({weightProgress.remainingWeight.toFixed(1)} KG to target - {weightProgress.progress.toFixed(1)}%)
                </span>
              )}
              {weightProgress.remainingWeight <= 0 && (
                <span className="ml-4 text-green-400">Goal Achieved! 🎉</span>
              )}
            </div>
          </div>

          {/* Add Weight Input */}
          <div className="flex gap-4">
            <input
              type="number"
              step="0.1"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              placeholder="Enter weight (KG)"
              className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 text-lg"
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
              Add Weight
            </button>
          </div>
        </div>
      </div>

      {/* Calendar View - 1 month per row */}
      <div className="w-full max-w-6xl mt-8">
        {/* One month per row */}
        {calendarMonths.map((monthData) => {
          const monthDays = getMonthData(monthData.year, monthData.month);
          const monthlySummary = getMonthlySummary(monthData.year, monthData.month);
          
          return (
            <div key={`${monthData.year}-${monthData.month}`} className="mb-8">
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">{monthData.name}</h2>
                  {/* Monthly Summary */}
                  <div className="flex gap-6 text-sm">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-400">{monthlySummary.totalDistance.toFixed(1)} km</div>
                      <div className="text-xs text-gray-400">Distance</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-400">{monthlySummary.totalRuns}</div>
                      <div className="text-xs text-gray-400">Runs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-400">{Math.floor(monthlySummary.totalTime / 60)}h {Math.floor(monthlySummary.totalTime % 60)}m</div>
                      <div className="text-xs text-gray-400">Time</div>
                    </div>
                  </div>
                </div>
                
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
                    if (!day || !day.dateObj || isNaN(day.dateObj.getTime())) {
                      return (
                        <div
                          key={index}
                          className="bg-gray-700 rounded p-1 text-center text-xs min-h-[48px] flex flex-col items-center justify-center"
                        >
                          <span className="text-gray-500">—</span>
                        </div>
                      );
                    }
                    
                    try {
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
                      
                      if (isPast && day.isCurrentMonth) {
                        bgColor = 'bg-gray-600/35';
                        textColor = 'text-gray-400';
                      } else if (isPast) {
                        bgColor = 'bg-gray-700/35';
                        textColor = 'text-gray-400';
                      }
                      
                      // Highlight days with activity - make it very visible
                      if (day.activity) {
                        bgColor = 'bg-blue-600';
                        textColor = 'text-white';
                      }
                      
                      return (
                        <div
                          key={index}
                          className={`${bgColor} ${textColor} rounded p-1 text-center text-xs min-h-[56px] flex flex-col items-center justify-center relative border-2 ${
                            day.activity ? 'border-blue-400 border-opacity-75' : 'border-transparent'
                          } group`}
                        >
                          <span className="font-semibold text-sm">{day.date}</span>
                          {day.activity && (
                            <>
                              <div className="text-sm mt-1 font-bold text-white">
                                {day.activity.distance.toFixed(1)}km
                              </div>
                              {/* Hover popup with all activity data */}
                              <div className="absolute z-50 hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-4 text-left">
                                <div className="text-base font-semibold text-white mb-3 border-b border-gray-700 pb-2">
                                  Activity Details
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Distance:</span>
                                    <span className="text-white font-semibold">{day.activity.distance.toFixed(1)} km</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Time:</span>
                                    <span className="text-white font-semibold">{Math.floor(day.activity.time)} min</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Pace:</span>
                                    <span className="text-white font-semibold">{day.activity.pace > 0 ? day.activity.pace.toFixed(2) : 'N/A'} min/km</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Avg HR:</span>
                                    <span className="text-white font-semibold">{day.activity.avgHeartRate > 0 ? Math.round(day.activity.avgHeartRate) : 'N/A'} bpm</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Max HR:</span>
                                    <span className="text-white font-semibold">{day.activity.maxHeartRate > 0 ? Math.round(day.activity.maxHeartRate) : 'N/A'} bpm</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">VO2 Max:</span>
                                    <span className="text-white font-semibold">{day.activity.vo2Max > 0 ? day.activity.vo2Max.toFixed(1) : 'N/A'}</span>
                                  </div>
                                </div>
                                {/* Arrow pointing down */}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                  <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                </div>
                              </div>
                            </>
                          )}
                          {day.weight && (
                            <div className="text-sm mt-1 text-yellow-300 font-semibold bg-yellow-900/30 px-1.5 py-0.5 rounded">
                              {day.weight.toFixed(1)}kg
                            </div>
                          )}
                        </div>
                      );
                    } catch (error) {
                      console.error('Error rendering calendar day:', error);
                      return (
                        <div
                          key={index}
                          className="bg-gray-700 rounded p-1 text-center text-xs min-h-[48px] flex flex-col items-center justify-center"
                        >
                          <span className="text-gray-500">—</span>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default WeightTracking;
