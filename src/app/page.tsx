import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import Link from "next/link";

import { CustomerFilters } from "@/components/customer-filters";
import { CustomerPagination } from "@/components/customer-pagination";
import { KycBadge } from "@/components/kyc-badge";
import { PageHeader } from "@/components/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatEur } from "@/lib/currency";
import {
  parseCustomerListQuery,
  selectCustomers,
  type CustomerListQuery,
  type SortColumn,
} from "@/lib/customer-list";

export const dynamic = "force-dynamic";

const COLUMN_LABELS: Record<SortColumn, string> = {
  name: "Name",
  dailyDepositCents: "Daily deposit limit",
};

// Re-sorting returns to the first page: page three of the old order has nothing
// to do with page three of the new one.
function sortHref(query: CustomerListQuery, column: SortColumn) {
  const params = new URLSearchParams();
  if (query.search) params.set("q", query.search);
  if (query.status !== "all") params.set("status", query.status);
  params.set("sort", column);
  if (query.sort === column && query.direction === "asc") params.set("dir", "desc");

  return `/?${params.toString()}`;
}

function SortableHead({
  query,
  column,
  align,
}: {
  query: CustomerListQuery;
  column: SortColumn;
  align?: "right";
}) {
  const active = query.sort === column;

  return (
    <TableHead
      aria-sort={active ? (query.direction === "asc" ? "ascending" : "descending") : "none"}
      className={align === "right" ? "text-right" : undefined}
    >
      <Link
        href={sortHref(query, column)}
        className="inline-flex items-center gap-1 hover:text-foreground"
      >
        {COLUMN_LABELS[column]}
        {active ? (
          query.direction === "asc" ? (
            <ArrowUpIcon className="size-3" />
          ) : (
            <ArrowDownIcon className="size-3" />
          )
        ) : null}
      </Link>
    </TableHead>
  );
}

export default async function CustomersPage(props: PageProps<"/">) {
  const query = parseCustomerListQuery(await props.searchParams);
  const { customers, total, page, pageCount } = selectCustomers(query);

  return (
    <>
      <PageHeader
        title="Customers"
        description="Accounts registered with the operator, with their current daily limits."
      />

      <CustomerFilters
        search={query.search}
        status={query.status}
        sort={query.sort}
        direction={query.direction}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <SortableHead query={query} column="name" />
            <TableHead>Email</TableHead>
            <TableHead>KYC status</TableHead>
            <TableHead>Tier</TableHead>
            <SortableHead query={query} column="dailyDepositCents" align="right" />
            <TableHead className="text-right">Daily withdrawal limit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No customers match these filters.
              </TableCell>
            </TableRow>
          ) : (
            customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">
                  <Link href={`/customers/${customer.id}`} className="hover:underline">
                    {customer.name}
                  </Link>
                </TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>
                  <KycBadge status={customer.kycStatus} />
                </TableCell>
                <TableCell className="capitalize">{customer.tier}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatEur(customer.limits.dailyDepositCents)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatEur(customer.limits.dailyWithdrawalCents)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <CustomerPagination
        page={page}
        pageCount={pageCount}
        total={total}
        search={query.search}
        sort={query.sort}
        direction={query.direction}
      />
    </>
  );
}
