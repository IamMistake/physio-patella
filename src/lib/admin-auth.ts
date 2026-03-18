import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const ADMIN_SESSION_COOKIE_NAME = "pp_admin_session";
const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 12;

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD ?? "admince";
}

function getAdminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? getAdminPassword();
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function signPayload(payload: string) {
  return createHmac("sha256", getAdminSessionSecret())
    .update(payload)
    .digest("base64url");
}

function buildSessionToken() {
  const expiresAt = Date.now() + ADMIN_SESSION_TTL_SECONDS * 1000;
  const payload = `admin:${expiresAt}`;
  const encodedPayload = Buffer.from(payload, "utf8").toString("base64url");
  const signature = signPayload(payload);

  return `${encodedPayload}.${signature}`;
}

function parseSessionToken(token: string) {
  const [encodedPayload, providedSignature] = token.split(".");

  if (!encodedPayload || !providedSignature) {
    return { valid: false } as const;
  }

  let payload = "";

  try {
    payload = Buffer.from(encodedPayload, "base64url").toString("utf8");
  } catch {
    return { valid: false } as const;
  }

  const expectedSignature = signPayload(payload);

  if (!safeCompare(providedSignature, expectedSignature)) {
    return { valid: false } as const;
  }

  if (!payload.startsWith("admin:")) {
    return { valid: false } as const;
  }

  const expiresAt = Number(payload.slice("admin:".length));

  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) {
    return { valid: false } as const;
  }

  return { valid: true } as const;
}

export function verifyAdminPassword(candidatePassword: string) {
  const provided = candidatePassword.trim();
  const expected = getAdminPassword().trim();

  return safeCompare(provided, expected);
}

export async function hasAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return false;
  }

  return parseSessionToken(token).valid;
}

export async function setAdminSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.set({
    name: ADMIN_SESSION_COOKIE_NAME,
    value: buildSessionToken(),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.set({
    name: ADMIN_SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
