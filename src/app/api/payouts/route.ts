import { NextResponse } from "next/server";

import { getCustomer, listPayouts } from "@/lib/store";

export const dynamic = "force-dynamic";

export function GET() {
  const payouts = listPayouts().map((payout) => {
    const customer = getCustomer(payout.customerId);

    return {
      ...payout,
      customerName: customer?.name ?? null,
      customerKycStatus: customer?.kycStatus ?? null,
    };
  });

  return NextResponse.json({ payouts });
}
