"use client";

import {
  googleCalendarUrl,
  icsFileContent,
  WEDDING_EVENTS,
  type WeddingEvent,
} from "@/lib/calendar";

/* "+ Add to Calendar" for one wedding event: Google link plus an
 * .ics download for Apple Calendar / Outlook. */
export default function AddToCalendar({
  eventKey,
}: {
  eventKey: WeddingEvent["key"];
}) {
  const event = WEDDING_EVENTS[eventKey];

  function downloadIcs() {
    const blob = new Blob([icsFileContent(event)], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.key}-danielle-sahaj.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <span className="inline-flex items-center gap-2 text-sm whitespace-nowrap">
      <span className="text-ink/60">+ Add to Calendar:</span>
      <a
        href={googleCalendarUrl(event)}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-blue-deep underline underline-offset-2 hover:text-magenta"
      >
        Google
      </a>
      <button
        type="button"
        onClick={downloadIcs}
        className="font-medium text-blue-deep underline underline-offset-2 hover:text-magenta"
      >
        Apple / Outlook
      </button>
    </span>
  );
}
