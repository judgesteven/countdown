'use client';

import { useEffect, useMemo, useState } from 'react';

interface LifeCalendarSettings {
  dob: string;
  targetAge: number;
  weeksPerRow: number;
}

const STORAGE_KEYS = {
  dob: 'lifeCalendar.dob',
  targetAge: 'lifeCalendar.targetAge',
  weeksPerRow: 'lifeCalendar.weeksPerRow',
};

const DEFAULT_SETTINGS: LifeCalendarSettings = {
  dob: '1972-01-01',
  targetAge: 87,
  weeksPerRow: 52,
};

// Calculates the Monday of the week for a given date in local time.
const getWeekStartMonday = (date: Date): Date => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay(); // Sunday = 0, Monday = 1, ...
  const offsetToMonday = (day + 6) % 7; // Monday → 0, Sunday → 6
  d.setDate(d.getDate() - offsetToMonday);
  d.setHours(0, 0, 0, 0);
  return d;
};

const msPerWeek = 7 * 24 * 60 * 60 * 1000;

const loadSettingsFromStorage = (): LifeCalendarSettings => {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS;
  }

  try {
    const storedDob = window.localStorage.getItem(STORAGE_KEYS.dob);
    const storedTargetAge = window.localStorage.getItem(STORAGE_KEYS.targetAge);
    const storedWeeksPerRow = window.localStorage.getItem(STORAGE_KEYS.weeksPerRow);

    const dob = storedDob || DEFAULT_SETTINGS.dob;
    const targetAge = storedTargetAge ? Number(storedTargetAge) : DEFAULT_SETTINGS.targetAge;
    const weeksPerRow = storedWeeksPerRow ? Number(storedWeeksPerRow) : DEFAULT_SETTINGS.weeksPerRow;

    return {
      dob,
      targetAge: Number.isFinite(targetAge) && targetAge > 0 ? targetAge : DEFAULT_SETTINGS.targetAge,
      weeksPerRow: Number.isFinite(weeksPerRow) && weeksPerRow > 0 ? weeksPerRow : DEFAULT_SETTINGS.weeksPerRow,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

const saveSettingsToStorage = (settings: LifeCalendarSettings) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.dob, settings.dob);
    window.localStorage.setItem(STORAGE_KEYS.targetAge, String(settings.targetAge));
    window.localStorage.setItem(STORAGE_KEYS.weeksPerRow, String(settings.weeksPerRow));
  } catch {
    // Ignore storage errors
  }
};

// Schedules a recalculation at the next local midnight and then every 24h.
const useMidnightRecompute = (onRecompute: () => void, enabled: boolean) => {
  useEffect(() => {
    if (!enabled) return;

    let timeoutId: number | undefined;
    let intervalId: number | undefined;

    const schedule = () => {
      const now = new Date();
      const nextMidnight = new Date(now);
      nextMidnight.setDate(now.getDate() + 1);
      nextMidnight.setHours(0, 0, 5, 0); // small buffer after midnight
      const delay = nextMidnight.getTime() - now.getTime();

      timeoutId = window.setTimeout(() => {
        onRecompute();
        intervalId = window.setInterval(onRecompute, 24 * 60 * 60 * 1000);
      }, delay);
    };

    schedule();

    return () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
      }
    };
  }, [onRecompute, enabled]);
};

const LifeCalendar = () => {
  const [mounted, setMounted] = useState(false);
  const [dob, setDob] = useState<string>(DEFAULT_SETTINGS.dob);
  const [targetAge, setTargetAge] = useState<number>(DEFAULT_SETTINGS.targetAge);
  const [weeksPerRow, setWeeksPerRow] = useState<number>(DEFAULT_SETTINGS.weeksPerRow);
  const [weekStarts, setWeekStarts] = useState<Date[]>([]);
  const [nowKey, setNowKey] = useState<number>(() => getWeekStartMonday(new Date()).getTime());

  const recomputeNow = () => {
    setNowKey(getWeekStartMonday(new Date()).getTime());
  };

  useMidnightRecompute(recomputeNow, mounted);

  useEffect(() => {
    const settings = loadSettingsFromStorage();
    setDob(settings.dob);
    setTargetAge(settings.targetAge);
    setWeeksPerRow(settings.weeksPerRow);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!dob || !targetAge || targetAge <= 0) {
      setWeekStarts([]);
      return;
    }

    const dobDate = new Date(dob);
    if (Number.isNaN(dobDate.getTime())) {
      setWeekStarts([]);
      return;
    }

    const dobWeekStart = getWeekStartMonday(dobDate);
    const endDate = new Date(dobWeekStart);
    endDate.setFullYear(endDate.getFullYear() + targetAge);
    const endWeekStart = getWeekStartMonday(endDate);

    const totalWeeksFloat = (endWeekStart.getTime() - dobWeekStart.getTime()) / msPerWeek;
    const totalWeeks = Math.max(0, Math.ceil(totalWeeksFloat));

    const weeks: Date[] = [];
    for (let i = 0; i < totalWeeks; i++) {
      const weekStart = new Date(dobWeekStart.getTime() + i * msPerWeek);
      weeks.push(weekStart);
    }
    setWeekStarts(weeks);

    saveSettingsToStorage({ dob, targetAge, weeksPerRow });
  }, [dob, targetAge, weeksPerRow]);

  const currentWeekStartTime = nowKey;

  const weeksWithStatus = useMemo(() => {
    return weekStarts.map((weekStart, index) => {
      const time = weekStart.getTime();
      let status: 'past' | 'current' | 'future';
      if (time < currentWeekStartTime) status = 'past';
      else if (time === currentWeekStartTime) status = 'current';
      else status = 'future';

      return {
        index,
        weekStart,
        status,
      };
    });
  }, [weekStarts, currentWeekStartTime]);

  const { totalWeeks, pastWeeks, remainingWeeks, remainingVsLivedPct } = useMemo(() => {
    const total = weeksWithStatus.length;
    const past = weeksWithStatus.filter((w) => w.status === 'past').length;
    const remaining = Math.max(0, total - past - 1);
    const pct =
      past > 0 ? Math.max(0, (remaining / past) * 100) : 0;
    return {
      totalWeeks: total,
      pastWeeks: past,
      remainingWeeks: remaining,
      remainingVsLivedPct: pct,
    };
  }, [weeksWithStatus]);

  const handleDobChange = (value: string) => {
    setDob(value);
  };

  const handleTargetAgeChange = (value: string) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setTargetAge(DEFAULT_SETTINGS.targetAge);
    } else {
      setTargetAge(parsed);
    }
  };

  const handleWeeksPerRowChange = (value: string) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setWeeksPerRow(DEFAULT_SETTINGS.weeksPerRow);
    } else {
      setWeeksPerRow(Math.min(104, parsed));
    }
  };

  const handleReset = () => {
    setDob(DEFAULT_SETTINGS.dob);
    setTargetAge(DEFAULT_SETTINGS.targetAge);
    setWeeksPerRow(DEFAULT_SETTINGS.weeksPerRow);
    saveSettingsToStorage(DEFAULT_SETTINGS);
  };

  const maxWidthStyle =
    weeksPerRow > 0
      ? {
          gridTemplateColumns: `repeat(${weeksPerRow}, minmax(0, 1fr))`,
        }
      : undefined;

  return (
    <div className="w-full max-w-6xl mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Life Calendar</h2>
          <p className="text-xs text-gray-400">
            Update DOB to your real date for accurate weeks.
          </p>
          <div className="mt-2 text-sm text-gray-200 space-x-3">
            <span>
              weeks remaining{' '}
              <span className="font-semibold text-green-400">
                {remainingWeeks.toLocaleString()}
              </span>
            </span>
            <span>
              weeks lived{' '}
              <span className="font-semibold text-blue-400">
                {pastWeeks.toLocaleString()}
              </span>
            </span>
            <span>
              %{' '}
              <span className="font-semibold text-cyan-400">
                {remainingVsLivedPct.toFixed(1)}
              </span>
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col">
            <label className="text-xs text-gray-400 mb-1" htmlFor="life-dob">
              Date of Birth
            </label>
            <input
              id="life-dob"
              type="date"
              value={dob}
              onChange={(e) => handleDobChange(e.target.value)}
              className="px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-400 mb-1" htmlFor="life-target-age">
              Target Age (years)
            </label>
            <input
              id="life-target-age"
              type="number"
              min={1}
              value={targetAge}
              onChange={(e) => handleTargetAgeChange(e.target.value)}
              className="w-20 px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:border-blue-500 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-xs font-semibold rounded-md border border-gray-600 text-gray-200 transition-colors"
          >
            Reset to defaults
          </button>
          <button
            type="button"
            onClick={recomputeNow}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-semibold rounded-md text-white transition-colors"
          >
            Recompute
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4 text-xs text-gray-300">
        <div className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm weekPast" aria-hidden="true" />
          <span>Past weeks</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm weekCurrent" aria-hidden="true" />
          <span>Current week</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm weekFuture" aria-hidden="true" />
          <span>Upcoming weeks</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div
          className="grid gap-[3px] auto-rows-[12px]"
          style={maxWidthStyle}
          aria-label="Life calendar showing weeks lived and remaining"
        >
          {[...weeksWithStatus].reverse().map(({ index, weekStart, status }) => {
            const dateLabel = weekStart.toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });
            const title = `Week ${index + 1} · starts ${dateLabel} · ${
              status === 'past' ? 'past' : status === 'current' ? 'current' : 'upcoming'
            }`;

            let className = 'life-week-cell ';
            if (status === 'past') className += 'weekPast';
            else if (status === 'future') className += 'weekFuture';
            else className += 'weekCurrent';

            return (
              <button
                key={weekStart.getTime()}
                type="button"
                className={className}
                title={title}
                aria-label={title}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LifeCalendar;

