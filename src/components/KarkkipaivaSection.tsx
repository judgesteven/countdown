import { useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'karkkipaivaWeek';
/** Finland (EET/EEST) — all calendar days and “today” use this zone */
const FINLAND_TZ = 'Europe/Helsinki';
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;

type DayAns = 'yes' | 'no' | null;
type SixDays = [DayAns, DayAns, DayAns, DayAns, DayAns, DayAns];

interface Stored {
  weekStartSunday: string;
  days: SixDays;
}

function getTodayFinland(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: FINLAND_TZ }));
}

function getSundayStartStringFinland(): string {
  const fin = getTodayFinland();
  const dow = fin.getDay();
  const sun = new Date(fin);
  sun.setDate(fin.getDate() - dow);
  return `${sun.getFullYear()}-${String(sun.getMonth() + 1).padStart(2, '0')}-${String(sun.getDate()).padStart(2, '0')}`;
}

function ymdAddDays(ymd: string, n: number): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const t = Date.UTC(y, m - 1, d + n);
  const x = new Date(t);
  return `${x.getUTCFullYear()}-${String(x.getUTCMonth() + 1).padStart(2, '0')}-${String(x.getUTCDate()).padStart(2, '0')}`;
}

const emptyWeek = (): SixDays => [null, null, null, null, null, null];

/** Sun–Fri only; drop legacy 7th slot if present */
function normalizeDaysArray(raw: unknown[]): SixDays | null {
  const mapped = raw.map((d) => (d === 'yes' || d === 'no' ? d : null)) as DayAns[];
  const head = mapped.slice(0, 6);
  while (head.length < 6) head.push(null);
  if (mapped.length === 0) return null;
  return head as SixDays;
}

function loadState(): Stored {
  const currentSunday = getSundayStartStringFinland();
  if (typeof window === 'undefined') {
    return { weekStartSunday: currentSunday, days: emptyWeek() };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Stored;
      if (parsed.weekStartSunday === currentSunday && Array.isArray(parsed.days) && parsed.days.length > 0) {
        const days = normalizeDaysArray(parsed.days);
        if (days) {
          return { weekStartSunday: currentSunday, days };
        }
      }
    }
  } catch {
    /* ignore */
  }
  return { weekStartSunday: currentSunday, days: emptyWeek() };
}

function saveState(st: Stored) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(st));
  } catch {
    /* ignore */
  }
}

function BigGreenCheck({ className = 'w-24 h-24' }: { className?: string }) {
  return (
    <svg
      className={`${className} text-emerald-400 drop-shadow-lg`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export default function KarkkipaivaSection() {
  const [mounted, setMounted] = useState(false);
  const [days, setDays] = useState<SixDays>(emptyWeek);

  const refreshFromStorage = useCallback(() => {
    const st = loadState();
    setDays(st.days);
  }, []);

  useEffect(() => {
    refreshFromStorage();
    setMounted(true);
  }, [refreshFromStorage]);

  useEffect(() => {
    if (!mounted) return;
    const tick = () => {
      refreshFromStorage();
    };
    document.addEventListener('visibilitychange', tick);
    const id = setInterval(tick, 60_000);
    return () => {
      document.removeEventListener('visibilitychange', tick);
      clearInterval(id);
    };
  }, [mounted, refreshFromStorage]);

  const finlandWeekday = getTodayFinland().getDay();
  /** Saturday is not a check-in day — no CTA, no column */
  const todayIsSaturday = finlandWeekday === 6;
  /** 0–5 Sun–Fri; Saturday uses -1 for “today” slot */
  const todaySlot: number = todayIsSaturday ? -1 : finlandWeekday;
  const weekStart = getSundayStartStringFinland();

  const noCount = days.filter((d) => d === 'no').length;
  const hasAnyNo = noCount > 0;
  const allYes = days.every((d) => d === 'yes');

  const negativeMood =
    noCount === 1
      ? {
          emoji: '😕',
          aria: 'Slightly disappointed',
          text: 'Oh no, what happened!? Do you deserve karkkipäiva this week??'
        }
      : noCount === 2
        ? {
            emoji: '😞',
            aria: 'More disappointed',
            text: 'Two slips — that’s more disappointing. Do you still deserve karkkipäiva this week??'
          }
        : noCount === 3
          ? {
              emoji: '😠',
              aria: 'Very disappointed',
              text: 'Three slips. Very disappointed — what is going on this week??'
            }
          : noCount >= 4
            ? {
                emoji: '😡',
                aria: 'Super pissed',
                text:
                  noCount === 4
                    ? 'Four slips?! Super pissed — karkkipäiva is not looking likely this week.'
                    : `${noCount} slips?! Super pissed — karkkipäiva is not looking likely this week.`
              }
            : null;

  const setAnswer = (slotIndex: number, ans: 'yes' | 'no') => {
    const sunday = getSundayStartStringFinland();
    setDays((prev) => {
      const next = [...prev] as SixDays;
      next[slotIndex] = ans;
      saveState({ weekStartSunday: sunday, days: next });
      return next;
    });
  };

  const slotEditable = (slotIndex: number) => {
    if (todayIsSaturday) return true;
    return slotIndex <= todaySlot;
  };

  const slotIsFuture = (slotIndex: number) => !todayIsSaturday && slotIndex > todaySlot;

  if (!mounted) {
    return (
      <div className="w-full max-w-4xl mb-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-2xl font-bold mb-2">Karkkipäivä</h2>
        <p className="text-gray-500 text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mb-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-2xl font-bold mb-6">Karkkipäivä</h2>

      {!todayIsSaturday && todaySlot >= 0 && (
        <div className="mb-8 rounded-xl bg-gray-900/80 border border-gray-600 p-6 text-center">
          <p className="text-lg font-medium text-white mb-4">Have you been good today?</p>
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            <button
              type="button"
              onClick={() => setAnswer(todaySlot, 'yes')}
              className="px-8 py-3 rounded-lg font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setAnswer(todaySlot, 'no')}
              className="px-8 py-3 rounded-lg font-semibold bg-gray-600 hover:bg-gray-500 text-white transition-colors"
            >
              No
            </button>
          </div>
          {days[todaySlot] === 'yes' && (
            <div className="flex justify-center">
              <BigGreenCheck />
            </div>
          )}
        </div>
      )}

      {todayIsSaturday && (
        <p className="mb-6 text-center text-gray-300 rounded-lg bg-gray-900/60 border border-gray-600 py-4 px-4">
          Saturday — not a check-in day. You can still update Sun–Fri below. Week of{' '}
          <span className="text-gray-400">{weekStart}</span>.
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {DAY_LABELS.map((label, slotIndex) => {
          const dateStr = ymdAddDays(weekStart, slotIndex);
          const ans = days[slotIndex];
          const editable = slotEditable(slotIndex);
          const future = slotIsFuture(slotIndex);

          return (
            <div
              key={slotIndex}
              className={`rounded-lg border p-3 flex flex-col items-center text-center min-h-[160px] ${
                future ? 'border-gray-700 bg-gray-900/40 opacity-60' : 'border-gray-600 bg-gray-900/60'
              }`}
            >
              <div className="text-xs text-gray-400 mb-1">{label}</div>
              <div className="text-sm font-mono text-gray-300 mb-2">{dateStr.slice(5)}</div>
              <div className="flex-1 flex items-center justify-center min-h-[56px]">
                {ans === 'yes' && <BigGreenCheck className="w-14 h-14" />}
                {ans === 'no' && (
                  <span className="text-5xl text-rose-400" aria-label="No">
                    ×
                  </span>
                )}
                {ans === null && !future && <span className="text-gray-500 text-sm">—</span>}
                {future && <span className="text-gray-600 text-xs">Upcoming</span>}
              </div>
              {editable && !future && (
                <div className="flex gap-1 mt-2 w-full justify-center">
                  <button
                    type="button"
                    onClick={() => setAnswer(slotIndex, 'yes')}
                    className={`flex-1 text-xs py-1.5 rounded font-medium transition-colors ${
                      ans === 'yes'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnswer(slotIndex, 'no')}
                    className={`flex-1 text-xs py-1.5 rounded font-medium transition-colors ${
                      ans === 'no'
                        ? 'bg-rose-700 text-white'
                        : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    }`}
                  >
                    No
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {(hasAnyNo || allYes) && (
        <div
          className="mt-8 flex flex-col items-center justify-center rounded-xl border border-gray-600 bg-gray-900/50 py-8 px-4"
          aria-live="polite"
        >
          {hasAnyNo && negativeMood ? (
            <span className="text-8xl leading-none" role="img" aria-label={negativeMood.aria}>
              {negativeMood.emoji}
            </span>
          ) : (
            <span className="text-8xl leading-none" role="img" aria-label="Happy">
              😊
            </span>
          )}
          <p className="mt-4 text-center text-sm text-gray-500 max-w-md">
            {hasAnyNo && negativeMood
              ? negativeMood.text
              : 'Nice work this week. You deserve a treat on Saturday.'}
          </p>
        </div>
      )}
    </div>
  );
}
