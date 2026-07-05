import type { Location } from "../types";
import { DateTime } from "luxon";

export function getSpecialHoursFromLocation(location: Location, noticeDays?: number): any[] {
  if (!location.special_hours) return [];

  const now = (location.timezone ? DateTime.now().setZone(location.timezone) : DateTime.now()).startOf("day");
  const lastVisibleDate = typeof noticeDays === "number" ? now.plus({ days: Math.max(0, noticeDays) }) : null;

  const specialHours = location.special_hours.filter((specialHour) => {
    const specialHourDate = DateTime.fromISO(specialHour.date, { zone: location.timezone || undefined }).startOf("day");

    if (specialHourDate < now) {
      return false;
    }

    return lastVisibleDate ? specialHourDate <= lastVisibleDate : true;
  });

  // sort by date
  specialHours.sort((a, b) => {
    const aDate = DateTime.fromISO(a.date);
    const bDate = DateTime.fromISO(b.date);
    return aDate > bDate ? 1 : -1;
  });

  return specialHours;
}
