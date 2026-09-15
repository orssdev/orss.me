"use client";

import { useSyncExternalStore } from "react";

const UPDATE_INTERVAL_MS = 30_000;

function formatNow(date: Date): string {
  const dateStr = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${dateStr}  ${timeStr}`;
}

function subscribe(onClockChange: () => void): () => void {
  const interval = setInterval(onClockChange, UPDATE_INTERVAL_MS);
  return function unsubscribe() {
    clearInterval(interval);
  };
}

// Stable between ticks: the formatted string only changes once the displayed minute does.
function getSnapshot(): string {
  return formatNow(new Date());
}

function getServerSnapshot(): string {
  return "";
}

export function MenuBarClock() {
  // The server has no meaningful clock; React fills this in on the first client render.
  const now = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return <span className="tabular-nums">{now}</span>;
}
