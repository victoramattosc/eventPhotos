import { cookies } from "next/headers";

const SESSION_COOKIE = "ep_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function getEventSession(): Promise<{ eventSlug: string; token: string } | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function setEventSession(eventSlug: string, token: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, JSON.stringify({ eventSlug, token }), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function clearEventSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export function verifyAdminCredentials(user: string, pass: string): boolean {
  return (
    user === process.env.ADMIN_USER &&
    pass === process.env.ADMIN_PASSWORD
  );
}

const ADMIN_COOKIE = "ep_admin";

export async function getAdminSession(): Promise<boolean> {
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value === "1";
}

export async function setAdminSession() {
  const store = await cookies();
  store.set(ADMIN_COOKIE, "1", {
    httpOnly: true,
    sameSite: "strict",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}
