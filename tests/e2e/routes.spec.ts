import { test } from "@playwright/test";
import { login, MEMBER, OWNER, visit, watchErrors } from "./helpers";

const PUBLIC = ["/", "/pricing", "/shop", "/shop/forge-whey-gold-standard", "/about", "/contact", "/equipment-guide", "/login", "/register"];
const MEMBER_PAGES = ["/cart", "/checkout", "/member/dashboard", "/member/ai", "/member/membership", "/member/orders", "/member/chat", "/member/profile", "/member/shop", "/member/equipment-guide"];
const ADMIN_PAGES = ["/admin/overview", "/admin/analytics", "/admin/members", "/admin/memberships", "/admin/orders", "/admin/inventory", "/admin/equipment", "/admin/payments", "/admin/chat", "/admin/settings", "/admin/ai"];


for (const path of PUBLIC) {
  test(`public ${path}`, async ({ page }) => {
    const errors = watchErrors(page);
    await visit(page, path, errors);
  });
}

test("public equipment guide detail", async ({ page }) => {
  const errors = watchErrors(page);
  await visit(page, "/equipment-guide", errors);
  const href = await page.locator('a[href^="/equipment-guide/"]').first().getAttribute("href");
  await visit(page, href!, errors);
});

test("member pages", async ({ page }) => {
  const errors = watchErrors(page);
  await login(page, MEMBER);
  for (const path of MEMBER_PAGES) await test.step(path, () => visit(page, path, errors));
  await visit(page, "/member/orders", errors);
  const href = await page.locator('a[href^="/member/orders/"]').first().getAttribute("href");
  if (href) await visit(page, href, errors);
});

test("owner pages", async ({ page }) => {
  const errors = watchErrors(page);
  await login(page, OWNER);
  for (const path of ADMIN_PAGES) await test.step(path, () => visit(page, path, errors));
  await visit(page, "/admin/orders", errors);
  const href = await page.locator('a[href^="/admin/orders/"]').first().getAttribute("href");
  if (href) await visit(page, href, errors);
});
