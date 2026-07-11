import nodemailer from "nodemailer";
import type { Household } from "@/app/rsvp/actions";

/* Sends the guest a confirmation email right after their RSVP,
 * summarizing exactly what was recorded for their household.
 *
 * Sends via Gmail SMTP using an app password (Google Account →
 * Security → 2-Step Verification → App passwords). Env vars:
 *
 *   GMAIL_USER          the Gmail address that sends the confirmation
 *   GMAIL_APP_PASSWORD  16-character app password for that account
 *
 * Not configured = silent no-op, so the RSVP flow works with or
 * without email set up. Failures are logged, never thrown: a guest's
 * RSVP must never fail because a confirmation couldn't send.
 */

const EVENTS = [
  { key: "welcomeParty", label: "Welcome Party — Thursday, May 20" },
  { key: "mehndi", label: "Mehndi — Friday, May 21" },
  { key: "weddingDay", label: "Wedding Day — Saturday, May 22" },
] as const;

export function confirmationText(household: Household): string {
  const events = EVENTS.filter(({ key }) => household.invited[key]);
  const lines = [
    `Thank you! We've received the RSVP for ${household.name}.`,
    "",
    "Here's what we have:",
    "",
  ];
  for (const guest of household.guests) {
    lines.push(guest.name);
    for (const { key, label } of events) {
      lines.push(`  ${label}: ${guest[key] ? "Attending" : "Not attending"}`);
    }
    lines.push("");
  }
  if (household.foodAllergies) {
    lines.push(`Food allergies: ${household.foodAllergies}`, "");
  }
  lines.push(
    "Responses can't be changed online — if plans change, please reach",
    "out to Danielle & Sahaj directly.",
    "",
    "We can't wait to celebrate with you!",
    "Danielle & Sahaj · May 20–22, 2027 · Cumming, GA",
  );
  return lines.join("\n");
}

const esc = (s: string) =>
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

export function confirmationHtml(household: Household): string {
  const events = EVENTS.filter(({ key }) => household.invited[key]);
  const guestBlocks = household.guests
    .map((guest) => {
      const rows = events
        .map(
          ({ key, label }) => `
        <tr>
          <td style="padding:4px 16px 4px 0;color:#33517a">${label}</td>
          <td style="padding:4px 0;${guest[key] ? "color:#4c7a34;font-weight:bold" : "color:#999"}">
            ${guest[key] ? "Attending" : "Not attending"}
          </td>
        </tr>`,
        )
        .join("");
      return `
      <h3 style="margin:18px 0 6px;color:#33517a">${esc(guest.name)}</h3>
      <table style="border-collapse:collapse;font-size:15px">${rows}</table>`;
    })
    .join("");

  return `
  <div style="font-family:Georgia,serif;color:#33517a;max-width:560px;margin:auto">
    <h1 style="text-align:center;color:#a62960;font-weight:normal">Thank you!</h1>
    <p style="text-align:center;font-size:16px">
      We've received the RSVP for <b>${esc(household.name)}</b>.
    </p>
    <hr style="border:none;border-top:1px solid #e3edf9;margin:20px 0" />
    ${guestBlocks}
    ${household.foodAllergies ? `<p style="margin-top:18px"><b>Food allergies:</b> ${esc(household.foodAllergies)}</p>` : ""}
    <hr style="border:none;border-top:1px solid #e3edf9;margin:20px 0" />
    <p style="color:#777;font-size:14px">
      Responses can&rsquo;t be changed online &mdash; if plans change, please
      reach out to Danielle &amp; Sahaj directly.
    </p>
    <p style="text-align:center;color:#a62960;font-size:16px;margin-top:24px">
      We can&rsquo;t wait to celebrate with you!<br/>
      <span style="color:#33517a">Danielle &amp; Sahaj &middot; May 20&ndash;22, 2027 &middot; Cumming, GA</span>
    </p>
  </div>`;
}

export async function sendGuestConfirmation(
  household: Household,
  toEmail: string,
): Promise<void> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
    await transporter.sendMail({
      from: `"Danielle & Sahaj" <${user}>`,
      to: toEmail,
      subject: "Your RSVP is confirmed — Danielle & Sahaj · May 20–22, 2027",
      text: confirmationText(household),
      html: confirmationHtml(household),
    });
  } catch (err) {
    console.error("RSVP confirmation email failed:", err);
  }
}
