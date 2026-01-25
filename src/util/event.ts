import type { Event, Location, Website } from "../types";
import { Event as SchemaEvent, WithContext } from "schema-dts";

export function isMultipleDays(start: Date, end: Date) {
  return start.getDate() !== end.getDate();
}

export function dateString(event: Event) {
  const startTime = new Date(event.start_time);
  const endTime = event.end_time ? new Date(event.end_time) : null;

  if (!endTime || isMultipleDays(startTime, endTime)) {
    const startDayShort = startTime.toLocaleDateString("en-US", { weekday: "short" });
    const startDate = startTime.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (endTime) {
      const endDate = endTime.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return `${startDayShort}, ${startDate} - ${endDate}`;
    }
    return `${startDayShort}, ${startDate}`;
  }

  const startDay = startTime.toLocaleDateString("en-US", { weekday: "short" });
  const startDate = startTime.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const startTimeString = startTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric" });
  const endTimeString = endTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric" });

  return `${startDay}, ${startDate}`;
}

export function timeString(event: Event) {
  const startTime = new Date(event.start_time);
  const endTime = event.end_time ? new Date(event.end_time) : null;

  const startTimeString = startTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric" });
  if (!endTime) {
    return startTimeString;
  }
  const endTimeString = endTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric" });

  return `${startTimeString} - ${endTimeString}`;
}

export function shortDescription(event: Event) {
  // event.description is html
  // strip html tags
  //   keep newlines
  // return first 50 chars

  if (!event.description) {
    return event.short_description || "";
  }

  const shortDescription = event.description.substring(0, 100);
  return shortDescription;
}

export function makeEventSchema(website: Website, event: Event, locations: Location[]): WithContext<SchemaEvent> {
  const schema: WithContext<SchemaEvent> = {
    "@context": "https://schema.org",
    "@type": "Event",
    "@id": `https://${website.domain}/events/${event.id}//#event`,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    url: `https://${website.domain}/events/${event.id}`,
    name: event.title,
    startDate: event.start_time,
  };

  if (event.description) {
    schema.description = event.description;
  }

  if (event.end_time) {
    schema.endDate = event.end_time;
  }

  if (locations.length > 0) {
    schema.location = [
      {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          streetAddress: locations[0].address,
          addressLocality: locations[0].city,
          addressRegion: locations[0].state,
          postalCode: locations[0].zip,
          addressCountry: "US",
        },
      },
    ];
  }

  if (event.cover_media?.url) {
    schema.image = {
      "@type": "ImageObject",
      url: event.cover_media.url,
    };
  }

  return schema;
}
