"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, adminToken } from "@/lib/admin";

const sha = (s: string) => createHash("sha256").update(s).digest();

export async function adminLogin(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const expected = process.env.ADMIN_PASSWORD;
  const token = adminToken();

  /* Compare hashes with a constant-time check, and make every failed
   * attempt cost a second — the password is shared by three people who
   * log in rarely, so this hurts only guessing scripts. */
  const valid =
    Boolean(expected) &&
    Boolean(token) &&
    timingSafeEqual(sha(password), sha(expected!));

  if (!valid) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    redirect("/admin?error=1");
  }

  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: 60 * 60 * 24 * 365, // the wedding is within a year
  });
  redirect("/admin");
}
