import { useState, useEffect } from "react";

export function useLiveClock(city: string, timezone: string) {
  const [formattedTime, setFormattedTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();

        // Time format: "9:50 am"
        const timeFormatter = new Intl.DateTimeFormat("en-US", {
          timeZone: timezone,
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });

        // Date format: "sun 28 sep"
        const dateFormatter = new Intl.DateTimeFormat("en-US", {
          timeZone: timezone,
          weekday: "short",
          day: "numeric",
          month: "short",
        });

        const timeStr = timeFormatter.format(now).toLowerCase();
        const dateStr = dateFormatter.format(now).toLowerCase();

        setFormattedTime(`${city} · ${timeStr} · ${dateStr}`);
      } catch {
        // Fallback if timezone not supported
        setFormattedTime(`${city} · Online`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 30000); // Update every 30s as specified

    return () => clearInterval(interval);
  }, [city, timezone]);

  return formattedTime;
}

