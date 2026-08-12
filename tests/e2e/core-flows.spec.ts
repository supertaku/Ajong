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
  await page.getByRole("button", { name: /open photo 3/i }).click();
  await expect(page).toHaveURL(/\/properties\/katipunan-condo-001\/photos#photo-3$/);
  await expect(page.context().pages()).toHaveLength(1);
  await expect(page.getByRole("heading", { name: "Photo tour" })).toBeVisible();
  await page.getByRole("button", { name: /back to property/i }).click();
  await expect(page).toHaveURL(/\/properties\/katipunan-condo-001$/);
  await page.getByRole("button", { name: /show all .* amenities/i }).click();
  await expect(page.getByRole("dialog", { name: /what this place offers/i })).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();
  await page.getByRole("complementary").getByRole("link", { name: "Reserve" }).click();
  await expect(page.getByRole("heading", { name: /confirm and reserve/i })).toBeVisible();
});

test("property host chat reuses its thread and persists messages", async ({ page }) => {
  await page.goto("/properties/katipunan-condo-001");
  await page.getByRole("complementary").getByRole("button", { name: "Message host" }).click();
  const chat = page.getByRole("dialog", { name: "Maya Santos" });
  await expect(chat).toBeVisible();
  await chat.getByRole("button", { name: "Is this still available?" }).click();
  await expect(chat.getByText(/still available for the listed move-in date/i)).toBeVisible();
  await chat.getByRole("button", { name: "Collapse chat" }).click();
  await page.reload();
  await page.getByRole("button", { name: "Open profile menu" }).click();
  await page.getByRole("button", { name: "Messages" }).click();
  await page.getByRole("dialog", { name: "Messages" }).getByRole("button", { name: /Maya Santos/i }).click();
  await expect(page.getByRole("dialog").getByText(/still available for the listed move-in date/i)).toBeVisible();
  const storedOwnerThreads = await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem("kubo-messages-v1") || "{}");
    return state.threads.filter((thread: { kind: string }) => thread.kind === "owner").length;
  });
  expect(storedOwnerThreads).toBe(1);
});

test("Kubo assistant summarizes a property and confirms reservation actions", async ({ page }) => {
  await page.goto("/properties/katipunan-condo-001");
  await page.getByRole("button", { name: "Ask Kubo" }).click();
  const chat = page.getByRole("dialog", { name: "Kubo assistant" });
  await chat.getByRole("button", { name: "Summarize this property" }).click();
  await expect(chat.getByText(/clearest summary/i)).toBeVisible();
  await chat.getByRole("button", { name: "Help me reserve" }).click();
  await expect(chat.getByRole("button", { name: "Review reservation" })).toBeVisible();
  await chat.getByRole("button", { name: "Review reservation" }).click();
  await expect(chat.getByRole("link", { name: "Continue to checkout" })).toBeVisible();
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
