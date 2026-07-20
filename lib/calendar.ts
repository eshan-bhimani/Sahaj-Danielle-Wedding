/* Calendar entries for the three wedding events.
 * Times are stored in UTC (May 2027 is EDT, UTC-4) so both Google
 * links and .ics files land at the right local time everywhere. */

export type WeddingEvent = {
  key: "welcomeParty" | "mehndi" | "weddingDay";
  title: string;
  startUtc: string; // YYYYMMDDTHHMMSSZ
  endUtc: string;
  location: string;
  description: string;
};

export const WEDDING_EVENTS: Record<WeddingEvent["key"], WeddingEvent> = {
  welcomeParty: {
    key: "welcomeParty",
    title: "Danielle & Sahaj — Welcome Party",
    startUtc: "20270520T210000Z", // Thu May 20, 2027 5:00 PM EDT
    endUtc: "20270521T010000Z", //                   9:00 PM EDT
    location: "2361 Academy Ct NE, Atlanta, GA 30345",
    description:
      "Welcome party at Sahaj's childhood home. Attire: Smart - Casual (Western or Pakistani).",
  },
  mehndi: {
    key: "mehndi",
    title: "Danielle & Sahaj — Mehndi",
    startUtc: "20270521T220000Z", // Fri May 21, 2027 6:00 PM EDT
    endUtc: "20270522T020000Z", //                   10:00 PM EDT
    location:
      "Shiloh Gardens Special Events Venue, 5235 Union Hill Road, Cumming, GA, 30040, United States",
    description:
      "Bridal Henna Ceremony. Attire: Western or Pakistani Formal Attire.",
  },
  weddingDay: {
    key: "weddingDay",
    title: "Danielle & Sahaj — Wedding Day",
    startUtc: "20270522T193000Z", // Sat May 22, 2027 3:30 PM EDT
    endUtc: "20270523T023000Z", //                   10:30 PM EDT
    location:
      "Shiloh Gardens Special Events Venue, 5235 Union Hill Road, Cumming, GA, 30040, United States",
    description:
      "Baraat, wedding ceremony, cocktail hour, and reception. Attire: Western or Pakistani Formal.",
  },
};

export function googleCalendarUrl(event: WeddingEvent): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${event.startUtc}/${event.endUtc}`,
    location: event.location,
    details: event.description,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

/* .ics file for Apple Calendar / Outlook. */
export function icsFileContent(event: WeddingEvent): string {
  const stamp =
    new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Danielle & Sahaj Wedding//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${event.key}-danielle-sahaj-2027`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${event.startUtc}`,
    `DTEND:${event.endUtc}`,
    `SUMMARY:${event.title}`,
    `LOCATION:${event.location.replaceAll(",", "\\,")}`,
    `DESCRIPTION:${event.description.replaceAll(",", "\\,")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
