import { NextResponse } from "next/server";

import { getPayout, rejectPayout } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Rejects a pending payout. */
export async function POST(_request: Request, ctx: RouteContext<"/api/payouts/[id]/reject">) {
  const { id } = await ctx.params;
  const payout = getPayout(id);

  if (!payout) {
    return NextResponse.json({ error: "Payout not found" }, { status: 404 });
  }

  if (payout.status !== "pending") {
    return NextResponse.json(
      { error: `This payout has already been ${payout.status}.` },
      { status: 409 },
    );
  }

  return NextResponse.json({ payout: rejectPayout(id) });
}
