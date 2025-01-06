import type { Location } from "../types";
import { DateTime } from "luxon";

export function getSpecialHoursFromLocation(location: Location): any[] {
  if (!location.special_hours) return [];

  // filter out any special hours that are before today
  const now = DateTime.now().startOf("day");
  if (location.timezone) now.setZone(location.timezone);

  const specialHours = location.special_hours.filter((specialHour) => {
    const specialHourDate = DateTime.fromISO(specialHour.date);
    return specialHourDate >= now;
  });

  // sort by date
  specialHours.sort((a, b) => {
    const aDate = DateTime.fromISO(a.date);
    const bDate = DateTime.fromISO(b.date);
    return aDate > bDate ? 1 : -1;
  });

  return specialHours;
}
