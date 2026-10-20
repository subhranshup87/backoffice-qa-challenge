"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatAmountInput, formatEur } from "@/lib/currency";
import { TIER_LIMITS, type LimitField, type Limits, type Tier } from "@/lib/limits";

const FIELDS = [
  { name: "dailyDepositCents", id: "daily-deposit", label: "Daily deposit limit" },
  { name: "dailyWithdrawalCents", id: "daily-withdrawal", label: "Daily withdrawal limit" },
] as const satisfies ReadonlyArray<{ name: LimitField; id: string; label: string }>;

type FieldErrors = Partial<Record<LimitField, string>>;

export function LimitsForm({
  customerId,
  tier,
  limits,
}: {
  customerId: string;
  tier: Tier;
  limits: Limits;
}) {
  const router = useRouter();
  const caps = TIER_LIMITS[tier];

  const [values, setValues] = useState<Record<LimitField, string>>({
    dailyDepositCents: formatAmountInput(limits.dailyDepositCents),
    dailyWithdrawalCents: formatAmountInput(limits.dailyWithdrawalCents),
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setErrors({});

    const response = await fetch(`/api/customers/${customerId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    });
    const body = (await response.json()) as { errors?: FieldErrors };

    setSaving(false);

    if (!response.ok) {
      setErrors(body.errors ?? {});
      return;
    }

    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={save} noValidate className="grid gap-4">
      <div className="flex flex-wrap gap-6">
        {FIELDS.map((field) => (
          <div key={field.name} className="grid gap-1.5">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Input
              id={field.id}
              name={field.name}
              className="w-48 tabular-nums"
              inputMode="decimal"
              aria-invalid={errors[field.name] ? true : undefined}
              aria-describedby={`${field.id}-hint`}
              value={values[field.name]}
              onChange={(event) =>
                setValues({ ...values, [field.name]: event.target.value })
              }
            />
            <p id={`${field.id}-hint`} className="text-xs text-muted-foreground">
              {errors[field.name] ?? `Up to ${formatEur(caps[field.name])} on this tier.`}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save limits"}
        </Button>
        {saved ? (
          <p role="status" className="text-sm text-muted-foreground">
            Limits saved.
          </p>
        ) : null}
      </div>
    </form>
  );
}
