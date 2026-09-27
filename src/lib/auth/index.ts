import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { users, authSessions, authAccounts, authVerifications } from "@/server/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user: users, session: authSessions, account: authAccounts, verification: authVerifications },
  }),
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  advanced: { database: { generateId: () => crypto.randomUUID() } },
  user: {
    additionalFields: {
      // input:false stops sign-up requests from self-assigning owner/admin.
      role: { type: "string", required: false, defaultValue: "customer", input: false },
    },
  },
  plugins: [nextCookies()],
});

export type SessionUser = typeof auth.$Infer.Session.user;

export const STAFF_ROLES = ["admin", "owner"] as const;
export const isStaff = (role?: string | null) => !!role && (STAFF_ROLES as readonly string[]).includes(role);

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session.user;
}

export async function requireStaff() {
  const user = await requireUser();
  if (!isStaff(user.role)) redirect("/member/dashboard");
  return user;
}
