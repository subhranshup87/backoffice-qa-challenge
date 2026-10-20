import { ArrowDownIcon, ArrowUpIcon, ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { KycBadge } from "@/components/kyc-badge";
import { LimitsForm } from "@/components/limits-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatEur } from "@/lib/currency";
import { getCustomer, listTransactions } from "@/lib/store";
import {
  DEFAULT_TRANSACTION_DIRECTION,
  formatTransactionDate,
  parseTransactionQuery,
  sortTransactions,
  type TransactionQuery,
  type TransactionSortColumn,
} from "@/lib/transactions";

export const dynamic = "force-dynamic";

const COLUMN_LABELS: Record<TransactionSortColumn, string> = {
  createdAt: "Date",
  amountCents: "Amount",
};

function sortHref(id: string, query: TransactionQuery, column: TransactionSortColumn) {
  const params = new URLSearchParams({ sort: column });
  const flipped = query.sort === column && query.direction === DEFAULT_TRANSACTION_DIRECTION;
  params.set("dir", flipped ? "asc" : DEFAULT_TRANSACTION_DIRECTION);

  return `/customers/${id}?${params.toString()}`;
}

function SortableHead({
  id,
  query,
  column,
  align,
}: {
  id: string;
  query: TransactionQuery;
  column: TransactionSortColumn;
  align?: "right";
}) {
  const active = query.sort === column;

  return (
    <TableHead
      aria-sort={active ? (query.direction === "asc" ? "ascending" : "descending") : "none"}
      className={align === "right" ? "text-right" : undefined}
    >
      <Link
        href={sortHref(id, query, column)}
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export default async function CustomerDetailPage(props: PageProps<"/customers/[id]">) {
  const { id } = await props.params;
  const customer = getCustomer(id);

  if (!customer) notFound();

  const query = parseTransactionQuery(await props.searchParams);
  const transactions = sortTransactions(listTransactions(id), query);

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link href="/">
          <ChevronLeftIcon data-icon="inline-start" />
          Customers
        </Link>
      </Button>

      <PageHeader title={customer.name} description={customer.email} />

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-wrap gap-x-12 gap-y-4">
              <Field label="Customer ID">
                <span className="font-mono">{customer.id}</span>
              </Field>
              <Field label="KYC status">
                <KycBadge status={customer.kycStatus} />
              </Field>
              <Field label="Tier">
                <span className="capitalize">{customer.tier}</span>
              </Field>
              <Field label="Registered">
                {formatTransactionDate(customer.registeredAt)}
              </Field>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily limits</CardTitle>
          </CardHeader>
          <CardContent>
            <LimitsForm customerId={customer.id} tier={customer.tier} limits={customer.limits} />
          </CardContent>
        </Card>

        <section aria-labelledby="transaction-history">
          <h2 id="transaction-history" className="mb-3 text-lg font-semibold tracking-tight">
            Transaction history
          </h2>

          <Table>
            <TableHeader>
              <TableRow>
                <SortableHead id={customer.id} query={query} column="createdAt" />
                <TableHead>Reference</TableHead>
                <TableHead>Type</TableHead>
                <SortableHead id={customer.id} query={query} column="amountCents" align="right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="tabular-nums">
                    {formatTransactionDate(transaction.createdAt)}
                  </TableCell>
                  <TableCell>{transaction.reference}</TableCell>
                  <TableCell className="capitalize">{transaction.type}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatEur(transaction.amountCents)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      </div>
    </>
  );
}
