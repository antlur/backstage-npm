import { Event } from "../types";

export function isMultipleDays(start: Date, end: Date) {
  return start.getDate() !== end.getDate();
}

export function dateString(event: Event) {
  const startTime = new Date(event.start_time);
  const endTime = new Date(event.end_time);

  if (isMultipleDays(startTime, endTime)) {
    const startDayShort = startTime.toLocaleDateString("en-US", { weekday: "short" });
    const startDate = startTime.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const endDate = endTime.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    return `${startDayShort}, ${startDate} - ${endDate}`;
  }

  const startDay = startTime.toLocaleDateString("en-US", { weekday: "short" });
  const startDate = startTime.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const startTimeString = startTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric" });
  const endTimeString = endTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric" });

  return `${startDay}, ${startDate}`;
}

export function timeString(event: Event) {
  const startTime = new Date(event.start_time);
  const endTime = new Date(event.end_time);

  const startTimeString = startTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric" });
  const endTimeString = endTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric" });

  return `${startTimeString} - ${endTimeString}`;
}

export function shortDescription(event: Event) {
  // event.description is html
  // strip html tags
  //   keep newlines
  // return first 50 chars

  const shortDescription = event.description.substring(0, 100);
  return shortDescription;
}
