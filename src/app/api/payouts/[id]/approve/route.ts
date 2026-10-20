import { NextResponse } from "next/server";

import { approvePayout, getCustomer, getPayout } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Approves a pending payout and books the withdrawal it pays out. */
export async function POST(_request: Request, ctx: RouteContext<"/api/payouts/[id]/approve">) {
  const { id } = await ctx.params;
  const payout = getPayout(id);

  if (!payout) {
    return NextResponse.json({ error: "Payout not found" }, { status: 404 });
  }

  const customer = getCustomer(payout.customerId);

  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  return NextResponse.json({ payout: approvePayout(id) });
}
