import { test, expect } from "@playwright/test";

// These tests run against the live dev server (port 5173).
// AniList is called for real — tests are resilient to slow network via generous timeouts.

test.describe("Homepage", () => {
  test("displays the ANTEIKU brand", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("ANTEIKU").first()).toBeVisible();
  });

  test("renders the Browse by Genre section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Browse by Genre")).toBeVisible({ timeout: 15_000 });
  });

  test("clicking a genre navigates to Explore with filter", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Action").first().click();
    await expect(page).toHaveURL(/genre=Action/);
  });
});

test.describe("Navigation", () => {
  test("Explore link goes to explore page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Explore" }).first().click();
    await expect(page).toHaveURL("/explore");
  });

  test("Seasonal link goes to seasonal page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Seasonal" }).first().click();
    await expect(page).toHaveURL("/seasonal");
  });

  test("unknown route shows 404 page", async ({ page }) => {
    await page.goto("/this-does-not-exist");
    await expect(page.getByText("This cup has run empty.")).toBeVisible();
  });
});

test.describe("Explore page", () => {
  test("renders the search input", async ({ page }) => {
    await page.goto("/explore");
    await expect(page.getByPlaceholder("Search by title…")).toBeVisible();
  });

  test("typing in search updates the URL", async ({ page }) => {
    await page.goto("/explore");
    await page.getByPlaceholder("Search by title…").fill("Naruto");
    await expect(page).toHaveURL(/q=Naruto/, { timeout: 2000 });
  });
});

test.describe("Auth flows", () => {
  test("sign in page is accessible", async ({ page }) => {
    await page.goto("/signin");
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("sign up page is accessible", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByRole("button", { name: /create account/i })).toBeVisible();
  });

  test("watchlist redirects to sign in when unauthenticated", async ({ page }) => {
    await page.goto("/watchlist");
    await expect(page).toHaveURL(/signin/);
  });
});
