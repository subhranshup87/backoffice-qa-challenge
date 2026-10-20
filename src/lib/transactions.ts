/**
 * Reading the transaction history's query string, and ordering the rows it
 * asks for. Like the customer list, the table is driven from the URL, so a
 * link reproduces exactly the ordering the operator was looking at.
 */

import { formatEur } from "@/lib/currency";
import type { Transaction } from "@/lib/store";

export const TRANSACTION_SORT_COLUMNS = ["createdAt", "amountCents"] as const;

export type TransactionSortColumn = (typeof TRANSACTION_SORT_COLUMNS)[number];

export type TransactionSortDirection = "asc" | "desc";

export type TransactionQuery = {
  sort: TransactionSortColumn;
  direction: TransactionSortDirection;
};

/** Newest first: the most recent activity is what an operator opens the screen for. */
export const DEFAULT_TRANSACTION_SORT: TransactionSortColumn = "createdAt";
export const DEFAULT_TRANSACTION_DIRECTION: TransactionSortDirection = "desc";

type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function isSortColumn(value: string): value is TransactionSortColumn {
  return (TRANSACTION_SORT_COLUMNS as readonly string[]).includes(value);
}

export function parseTransactionQuery(params: RawSearchParams): TransactionQuery {
  const sort = first(params.sort);
  const direction = first(params.dir);

  return {
    sort: isSortColumn(sort) ? sort : DEFAULT_TRANSACTION_SORT,
    direction: direction === "asc" || direction === "desc" ? direction : DEFAULT_TRANSACTION_DIRECTION,
  };
}

// Each column is ordered on the value the table puts in the cell, so the order
// the operator sees always follows the column they clicked.
function compare(a: Transaction, b: Transaction, column: TransactionSortColumn): number {
  return column === "createdAt"
    ? a.createdAt.localeCompare(b.createdAt)
    : formatEur(a.amountCents).localeCompare(formatEur(b.amountCents), "de");
}

export function sortTransactions(
  transactions: Transaction[],
  query: TransactionQuery,
): Transaction[] {
  return [...transactions].sort((a, b) => {
    const order = compare(a, b, query.sort);
    return query.direction === "desc" ? -order : order;
  });
}

const DATE_FORMATTER = new Intl.DateTimeFormat("de-DE", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

/** Renders a transaction timestamp in the de-DE convention, e.g. `05.06.2024, 08:00`. */
export function formatTransactionDate(iso: string): string {
  return DATE_FORMATTER.format(new Date(iso)).replace(/\u00a0/g, " ");
}
