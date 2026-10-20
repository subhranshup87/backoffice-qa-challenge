import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { PageHeader } from "@/components/page-header";

it("renders the page title as a heading", () => {
  render(<PageHeader title="Customers" description="60 accounts" />);

  expect(screen.getByRole("heading", { name: "Customers" })).toBeVisible();
  expect(screen.getByText("60 accounts")).toBeVisible();
});
