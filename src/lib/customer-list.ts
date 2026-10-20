/**
 * Reading the customer list's query string, and turning it into a page of
 * customers. The list is driven entirely by the URL — search term, KYC filter,
 * sort column and page number — so a link reproduces exactly what the operator
 * was looking at.
 */

import { listCustomers, type Customer, type KycStatus } from "@/lib/store";

/** Rows per page. Ten keeps the table readable without scrolling. */
export const PAGE_SIZE = 10;

export const SORT_COLUMNS = ["name", "dailyDepositCents"] as const;

export type SortColumn = (typeof SORT_COLUMNS)[number];

export type SortDirection = "asc" | "desc";

export type StatusFilter = KycStatus | "all";

export const STATUS_FILTERS = ["all", "verified", "pending", "rejected"] as const;

export type CustomerListQuery = {
  search: string;
  status: StatusFilter;
  sort: SortColumn;
  direction: SortDirection;
  page: number;
};

export const DEFAULT_SORT: SortColumn = "name";
export const DEFAULT_DIRECTION: SortDirection = "asc";

function isStatusFilter(value: string): value is StatusFilter {
  return (STATUS_FILTERS as readonly string[]).includes(value);
}

function isSortColumn(value: string): value is SortColumn {
  return (SORT_COLUMNS as readonly string[]).includes(value);
}

type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export function parseCustomerListQuery(params: RawSearchParams): CustomerListQuery {
  const status = first(params.status);
  const sort = first(params.sort);
  const page = Number.parseInt(first(params.page), 10);

  return {
    search: first(params.q).trim(),
    status: isStatusFilter(status) ? status : "all",
    sort: isSortColumn(sort) ? sort : DEFAULT_SORT,
    direction: first(params.dir) === "desc" ? "desc" : DEFAULT_DIRECTION,
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

function matchesSearch(customer: Customer, search: string): boolean {
  const term = search.toLowerCase();
  return (
    customer.name.toLowerCase().includes(term) || customer.email.toLowerCase().includes(term)
  );
}

function compare(a: Customer, b: Customer, column: SortColumn): number {
  return column === "name"
    ? a.name.localeCompare(b.name, "en")
    : a.limits.dailyDepositCents - b.limits.dailyDepositCents;
}

export type CustomerListPage = {
  customers: Customer[];
  /** Rows matching the filters, across every page. */
  total: number;
  page: number;
  pageCount: number;
};

export function selectCustomers(query: CustomerListQuery): CustomerListPage {
  let matches = listCustomers();

  if (query.search) {
    matches = matches.filter((customer) => matchesSearch(customer, query.search));
  }

  if (query.status !== "all") {
    matches = matches.filter((customer) => customer.kycStatus === query.status);
  }

  matches.sort((a, b) => {
    const order = compare(a, b, query.sort);
    return query.direction === "desc" ? -order : order;
  });

  const pageCount = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const page = Math.min(query.page, pageCount);
  const start = (page - 1) * PAGE_SIZE;

  return {
    customers: matches.slice(start, start + PAGE_SIZE),
    total: matches.length,
    page,
    pageCount,
  };
}
