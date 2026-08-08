import { Fragment, useEffect, useState } from 'react';

interface CountdownTimerProps {
  endDate?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
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

export default function CountdownTimer({
  endDate,
  size = 'md',
  variant = 'light',
  fallbackDays = 5,
  onEnded,
}: CountdownTimerProps) {
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

  const valueClass = size === 'sm' ? 'text-[13px]' : size === 'lg' ? 'text-3xl' : 'text-xl';
  const labelClass = size === 'sm' ? 'text-[7px]' : size === 'lg' ? 'text-xs' : 'text-[10px]';
  const gapClass = size === 'sm' ? 'gap-1' : size === 'lg' ? 'gap-2' : 'gap-1.5';

  const dark = variant === 'dark';
  const digitClass = dark
    ? 'text-kosmo [text-shadow:0_0_10px_rgba(255,0,130,0.55)]'
    : 'text-kosmo-600 [text-shadow:0_0_6px_rgba(204,0,104,0.2)]';
  const labelColor = dark ? 'text-white/50' : 'text-cosmos/60';

  const units = [
    { value: timeLeft.days, label: 'dias' },
    { value: timeLeft.hours, label: 'horas' },
    { value: timeLeft.minutes, label: 'min' },
    { value: timeLeft.seconds, label: 'seg' },
  ];

  if (timeLeft.done) {
    return (
      <span className={`inline-flex items-center gap-1 font-arcade ${valueClass} ${digitClass}`}>
        Edição encerrada
      </span>
    );
  }

  return (
    <div className={`flex flex-wrap items-baseline ${gapClass}`}>
      {units.map((unit, i) => (
        <Fragment key={unit.label}>
          <div className="flex flex-col items-center leading-none">
            <span className={`font-arcade ${valueClass} ${digitClass} leading-none`}>{pad(unit.value)}</span>
            <span className={`${labelClass} ${labelColor} font-body font-medium uppercase tracking-wider mt-0.5 leading-none`}>
              {unit.label}
            </span>
          </div>
          {i < units.length - 1 && (
            <span className={`font-arcade ${valueClass} ${digitClass} leading-none animate-pulse`}>:</span>
          )}
        </Fragment>
      ))}
    </div>
  );
}
