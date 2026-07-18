import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test("home offers guide, manual search, bilingual copy, and no serious accessibility violations", async ({ page }) => {
  test.setTimeout(60_000);
  await expect(page.getByRole("link", { name: /start with kubo/i }).first()).toBeVisible();
  await page.getByRole("link", { name: "Settings" }).click();
  await page.getByRole("button", { name: "Filipino" }).click();
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Pamilya muna." }).first()).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
});

test("one wheel step plays a complete chapter and the visible control plays the next", async ({ page }) => {
  const journey = page.locator(".scroll-journey");
  const playControl = page.locator(".journey-play");
  const bounds = await journey.boundingBox();
  expect(bounds).not.toBeNull();
  await expect(page.getByRole("button", { name: /play this scene/i })).toBeVisible();

  await page.mouse.move((bounds?.x ?? 0) + (bounds?.width ?? 1) / 2, (bounds?.y ?? 0) + (bounds?.height ?? 1) / 2);
  await page.mouse.wheel(0, 120);
  await expect(playControl).toBeDisabled();
  await expect(page.locator('video[data-clip="family"]')).toHaveClass(/active/);

  await page.locator('video[data-clip="family"]').evaluate((video) => video.dispatchEvent(new Event("ended", { bubbles: true })));
  await expect(page.locator('video[data-clip="family-choices"]')).toHaveClass(/active/);
  await page.locator('video[data-clip="family-choices"]').evaluate((video) => video.dispatchEvent(new Event("ended", { bubbles: true })));

  await expect(page.getByRole("heading", { name: "City access or more space?" })).toBeVisible();
  await expect(playControl).toBeEnabled();
  await playControl.click();
  await expect(page.locator('video[data-clip="choices"]')).toHaveClass(/active/);
  await expect(playControl).toBeDisabled();
});

test("guided matching exposes counts and reaches explainable results", async ({ page }) => {
  await page.goto("/guide");
  await expect(page.getByText(/Question 1 of 6/)).toBeVisible();
  for (let index = 0; index < 5; index += 1) await page.getByRole("button", { name: /next question/i }).click();
  await page.getByRole("button", { name: /see my matches/i }).click();
  await expect(page.getByText(/of 48 homes fit/i)).toBeVisible();
  await expect(page.getByText(/How the 100-point fit score works/i)).toBeVisible();
});

test("Kubo reacts to the guide, budget typing is formatted, help opens, and dark mode persists", async ({ page }) => {
  await page.goto("/guide");
  await expect(page.getByRole("img", { name: /Kubo thinking with a wooden calculator/i })).toBeVisible();

  const budget = page.getByLabel("Monthly housing budget", { exact: true });
  await budget.fill("85000");
  await expect(budget).toHaveValue("85,000");

  await page.getByRole("button", { name: "Cash ready for a down payment: help" }).click();
  await expect(page.getByText(/A down payment is money paid at the start/i)).toBeVisible();

  await page.getByRole("button", { name: /next question/i }).click();
  await expect(page.getByRole("img", { name: /Kubo exploring a map/i })).toBeVisible();

  await page.locator(".theme-switch__container").click();
  await expect(page.getByRole("checkbox", { name: "Use light mode" })).toBeChecked();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("manual search keeps a visible deterministic count", async ({ page }) => {
  await page.goto("/properties");
  await expect(page.getByText("48", { exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: /filters/i }).click();
  await page.getByLabel("Cavite").check();
  await expect(page.getByText("6", { exact: true }).first()).toBeVisible();
});

test("seller submission, moderation, status, and reset persist locally", async ({ page }) => {
  await page.goto("/sell");
  await page.getByRole("button", { name: /next step/i }).click();
  await page.getByRole("button", { name: /next step/i }).click();
  await page.getByRole("button", { name: /next step/i }).click();
  await page.getByRole("button", { name: /submit for review/i }).click();
  await expect(page.getByText(/current status: submitted/i)).toBeVisible();
  await page.goto("/demo/admin");
  await page.getByRole("button", { name: /request changes/i }).click();
  await page.goto("/seller/status");
  await expect(page.getByRole("heading", { name: /changes requested/i })).toBeVisible();
  await page.goto("/settings");
  await page.getByRole("button", { name: /reset saved data/i }).click();
  await expect(page.getByRole("status")).toContainText(/back at the starting point/i);
  await page.goto("/seller/status");
  await expect(page.getByRole("heading", { name: /submitted for review/i })).toBeVisible();
});
