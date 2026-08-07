import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  endDate?: string;
  size?: 'sm' | 'md' | 'lg';
  fallbackDays?: number;
  onEnded?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

function getEndTimestamp(endDate?: string, fallbackDays = 5): number {
  if (endDate) {
    const ts = new Date(endDate).getTime();
    if (!Number.isNaN(ts)) return ts;
  }
  return Date.now() + fallbackDays * 24 * 60 * 60 * 1000;
}

function getTimeLeft(target: number): TimeLeft {
  const diff = Math.max(0, target - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    done: diff === 0,
  };
}

const pad = (n: number) => String(n).padStart(2, '0');

export default function CountdownTimer({ endDate, size = 'md', fallbackDays = 5, onEnded }: CountdownTimerProps) {
  const [target] = useState(() => getEndTimestamp(endDate, fallbackDays));
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeft(target));

  useEffect(() => {
    const interval = setInterval(() => {
      const next = getTimeLeft(target);
      setTimeLeft(next);
      if (next.done && onEnded) onEnded();
    }, 1000);
    return () => clearInterval(interval);
  }, [target, onEnded]);

  const boxClass =
    size === 'sm'
      ? 'min-w-[34px] px-1.5 py-1'
      : size === 'lg'
      ? 'min-w-[56px] px-3 py-2.5'
      : 'min-w-[44px] px-2 py-1.5';

  const valueClass = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : 'text-lg';
  const labelClass = size === 'sm' ? 'text-[8px]' : size === 'lg' ? 'text-xs' : 'text-[10px]';

  const units = [
    { value: timeLeft.days, label: 'dias' },
    { value: timeLeft.hours, label: 'horas' },
    { value: timeLeft.minutes, label: 'min' },
    { value: timeLeft.seconds, label: 'seg' },
  ];

  if (timeLeft.done) {
    return (
      <span className={`inline-flex items-center gap-1.5 font-semibold ${valueClass} text-kosmo`}>
        Edição encerrada
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {units.map((unit, i) => (
        <div key={unit.label} className="flex items-center gap-1.5">
          <div
            className={`${boxClass} rounded-lg bg-cosmos text-white flex flex-col items-center justify-center leading-none shadow-md shadow-kosmo/10`}
          >
            <span className={`font-display font-bold ${valueClass} tabular-nums`}>{pad(unit.value)}</span>
            <span className={`${labelClass} text-white/50 font-medium uppercase tracking-wider mt-0.5`}>{unit.label}</span>
          </div>
          {i < units.length - 1 && <span className={`font-display font-bold text-kosmo ${valueClass}`}>:</span>}
        </div>
      ))}
    </div>
  );
}
