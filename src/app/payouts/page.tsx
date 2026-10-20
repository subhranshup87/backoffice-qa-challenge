import { KycBadge } from "@/components/kyc-badge";
import { PageHeader } from "@/components/page-header";
import { PayoutActions } from "@/components/payout-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatEur } from "@/lib/currency";
import { getCustomer, listPayouts, type Payout } from "@/lib/store";
import { formatTransactionDate } from "@/lib/transactions";

export const dynamic = "force-dynamic";

const METHOD_LABELS: Record<Payout["method"], string> = { sepa: "SEPA", paypal: "PayPal" };

export default function PayoutsPage() {
  // Longest waiting first: the queue is worked from the top.
  const pending = listPayouts()
    .filter((payout) => payout.status === "pending")
    .sort((a, b) => a.requestedAt.localeCompare(b.requestedAt));

  return (
    <>
      <PageHeader
        title="Payouts"
        description="Payout requests awaiting a decision. Approving one books the withdrawal."
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Payout</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>KYC status</TableHead>
            <TableHead>Requested</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Decision</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pending.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No payouts are waiting for a decision.
              </TableCell>
            </TableRow>
          ) : (
            pending.map((payout) => {
              const customer = getCustomer(payout.customerId);
              const customerName = customer?.name ?? payout.customerId;

              return (
                <TableRow key={payout.id}>
                  <TableCell className="font-mono">{payout.id}</TableCell>
                  <TableCell className="font-medium">{customerName}</TableCell>
                  <TableCell>
                    {customer ? <KycBadge status={customer.kycStatus} /> : null}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatTransactionDate(payout.requestedAt)}
                  </TableCell>
                  <TableCell>{METHOD_LABELS[payout.method]}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatEur(payout.amountCents)}
                  </TableCell>
                  <TableCell className="text-right">
                    <PayoutActions
                      payoutId={payout.id}
                      customerName={customerName}
                      amountCents={payout.amountCents}
                      kycVerified={customer?.kycStatus === "verified"}
                    />
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </>
  );
}
