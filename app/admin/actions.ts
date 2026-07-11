"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, adminToken } from "@/lib/admin";

export async function adminLogin(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const token = adminToken();

  if (!token || password !== process.env.ADMIN_PASSWORD) {
    redirect("/admin?error=1");
  }

  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: 60 * 60 * 24 * 365, // the wedding is within a year
  });
  redirect("/admin");
}
