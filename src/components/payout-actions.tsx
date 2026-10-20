"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { formatEur } from "@/lib/currency";

/**
 * The decision controls on a queued payout. Approve is offered only for a
 * KYC-verified customer; reject goes behind a confirmation, because a rejected
 * payout cannot be reopened.
 */
export function PayoutActions({
  payoutId,
  customerName,
  amountCents,
  kycVerified,
}: {
  payoutId: string;
  customerName: string;
  amountCents: number;
  kycVerified: boolean;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  async function decide(decision: "approve" | "reject") {
    await fetch(`/api/payouts/${payoutId}/${decision}`, { method: "POST" });
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {kycVerified ? (
        <Button onClick={() => decide("approve")}>Approve</Button>
      ) : (
        <span className="text-xs text-muted-foreground">KYC not verified</span>
      )}

      <Button variant="outline" onClick={() => setConfirming(true)}>
        Reject
      </Button>

      <ConfirmDialog
        open={confirming}
        title="Reject this payout?"
        description={`${formatEur(amountCents)} to ${customerName} will not be paid out. A rejected payout cannot be reopened.`}
        confirmLabel="Reject payout"
        onConfirm={() => {
          setConfirming(false);
          decide("reject");
        }}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
