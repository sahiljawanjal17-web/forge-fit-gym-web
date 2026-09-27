import { expect, type Page } from "@playwright/test";

export const OWNER = { email: "owner@forgefit.com", password: "Owner@12345" };
export const MEMBER = { email: "member@forgefit.com", password: "Member@12345" };

export async function login(page: Page, user: { email: string; password: string }) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 60_000 });
}

// Collects uncaught page errors and console errors (hydration mismatches show up here).
export function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const text = m.text();
    // Dev-only noise that is not an app bug.
    if (/Download the React DevTools|Failed to load resource/i.test(text)) return;
    errors.push(`console: ${text.slice(0, 300)}`);
  });
  // Report failed requests with their URL (the console message omits it).
  page.on("response", (r) => {
    if (r.status() >= 400 && !r.url().includes("/_next/webpack-hmr")) errors.push(`http ${r.status()}: ${r.url()}`);
  });
  return errors;
}

export async function visit(page: Page, path: string, errors: string[]) {
  const before = errors.length;
  const res = await page.goto(path, { waitUntil: "load" });
  expect(res?.status(), `${path} status`).toBeLessThan(400);
  await page.waitForTimeout(1500);
  expect(errors.slice(before), `${path} errors`).toEqual([]);
}
