import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => { await page.goto("/"); await page.evaluate(() => localStorage.clear()); await page.reload(); });

test("home search opens destination overlay and reaches results", async ({ page }) => {
  await expect(page.getByRole("heading", { name: /find a place that fits your life/i })).toBeVisible();
  await page.getByRole("button", { name: /metro manila/i }).click();
  await page.getByLabel("Destination").fill("Makati");
  await page.getByRole("dialog").getByRole("button", { name: /Makati/ }).click();
  await page.getByRole("button", { name: /choose renters/i }).click();
  await page.getByRole("button", { name: /show rentals/i }).click();
  await expect(page).toHaveURL(/properties/);
  await expect(page.getByRole("heading", { name: /places to rent near makati/i })).toBeVisible();
});

test("results expose filters and the OpenStreetMap view", async ({ page }) => {
  await page.goto("/properties?where=Metro%20Manila&lease=12&adults=1");
  await expect(page.getByText(/100 homes/)).toBeVisible();
  await page.getByRole("button", { name: /^Filters/ }).click();
  await page.getByRole("button", { name: "Dorm room" }).click();
  await page.getByRole("button", { name: /Show \d+ rentals/ }).click();
  await expect(page.getByText(/homes/).first()).toBeVisible();
  await expect(page.locator(".leaflet-container")).toBeVisible();
});

test("property page supports gallery, amenities, reviews, and reserve", async ({ page }) => {
  await page.goto("/properties/katipunan-condo-001");
  await page.getByRole("button", { name: /show all photos/i }).click();
  await expect(page.getByRole("dialog", { name: "Photo tour" })).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();
  await page.getByRole("button", { name: /show all .* amenities/i }).click();
  await expect(page.getByRole("dialog", { name: /what this place offers/i })).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();
  await page.getByRole("link", { name: "Reserve" }).click();
  await expect(page.getByRole("heading", { name: /confirm and reserve/i })).toBeVisible();
});

test("reservation is stored and appears as a confirmed trip", async ({ page }) => {
  await page.goto("/reserve/katipunan-condo-001?moveIn=2026-10-01&lease=12&adults=1&children=0&pets=0");
  await page.getByRole("button", { name: /confirm and pay/i }).click();
  await expect(page.getByRole("heading", { name: /you are moving to katipunan/i })).toBeVisible();
  await page.goto("/trips");
  await expect(page.getByText("Confirmed").first()).toBeVisible();
});

test("homepage has no serious accessibility violations", async ({ page }) => {
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
});
