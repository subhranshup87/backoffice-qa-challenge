import { expect, test } from "@playwright/test";

test("the customer list is the entry point of the backoffice", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Customers" })).toBeVisible();
});
