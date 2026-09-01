"use client";

import { useEffect, useState } from "react";

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getCountdown(target: Date): Countdown | null {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return null;

  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

function TimeBox({ display, label }: { display: string; label: string }) {
  return (
    <div className="flex min-w-[4.5rem] flex-col items-center gap-1 sm:min-w-[6rem]">
      <div className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.3)] backdrop-blur-sm sm:px-4 sm:py-4">
        <span className="block text-3xl font-semibold tabular-nums text-amber-50 sm:text-5xl">
          {display}
        </span>
      </div>
      <span className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-amber-100/60 sm:text-xs">
        {label}
      </span>
    </div>
  );
}

export default function CountdownTimer({ targetDate }: { targetDate: string }) {
  const target = new Date(targetDate);
  // Start null so the SSR markup matches the first client render (no
  // hydration mismatch), then tick only after mount.
  const [time, setTime] = useState<Countdown | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const update = () => setTime(getCountdown(target));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetDate]); // eslint-disable-line react-hooks/exhaustive-deps

  // Past the launch date (only decide once mounted — never at SSR time).
  if (mounted && time === null) {
    return (
      <p className="text-xl font-medium text-amber-100 sm:text-2xl">
        We have launched! ✨
      </p>
    );
  }

  // Before mount: "--" placeholders; after: live numbers.
  return (
    <div className="flex items-start justify-center gap-3 sm:gap-5">
      <TimeBox display={time ? pad(time.days) : "--"} label="Days" />
      <TimeBox display={time ? pad(time.hours) : "--"} label="Hours" />
      <TimeBox display={time ? pad(time.minutes) : "--"} label="Mins" />
      <TimeBox display={time ? pad(time.seconds) : "--"} label="Secs" />
    </div>
  );
}
