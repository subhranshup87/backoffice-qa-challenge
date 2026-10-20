import { NextResponse } from "next/server";

import { parseEurAmount } from "@/lib/currency";
import { validateLimits, type LimitField, type Limits } from "@/lib/limits";
import { getCustomer, listTransactions, updateCustomerLimits } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const customer = getCustomer(id);

  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  return NextResponse.json({ customer, transactions: listTransactions(id) });
}

/** The limits form posts what the operator typed; the amounts are read here. */
type LimitsPayload = Partial<Record<LimitField, string>>;

const AMOUNT_ERROR = "Enter an amount like 1.500,00.";

function readAmounts(
  payload: LimitsPayload,
): { limits: Limits } | { errors: Partial<Record<LimitField, string>> } {
  const errors: Partial<Record<LimitField, string>> = {};
  const limits: Limits = { dailyDepositCents: 0, dailyWithdrawalCents: 0 };

  for (const field of ["dailyDepositCents", "dailyWithdrawalCents"] as const) {
    const raw = payload[field];
    const cents = typeof raw === "string" ? parseEurAmount(raw) : null;

    if (cents === null) {
      errors[field] = AMOUNT_ERROR;
      continue;
    }

    limits[field] = cents;
  }

  return Object.keys(errors).length === 0 ? { limits } : { errors };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const customer = getCustomer(id);

  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  const payload = (await request.json().catch(() => null)) as LimitsPayload | null;

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "Expected a limits payload" }, { status: 400 });
  }

  const read = readAmounts(payload);

  if ("errors" in read) {
    return NextResponse.json({ errors: read.errors }, { status: 400 });
  }

  const validation = validateLimits(customer.tier, read.limits);

  if (!validation.ok) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  return NextResponse.json({ customer: updateCustomerLimits(id, read.limits) });
}
