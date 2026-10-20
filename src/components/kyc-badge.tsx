import { Badge } from "@/components/ui/badge";
import type { KycStatus } from "@/lib/store";

type BadgeVariant = "secondary" | "destructive" | "outline";

const VARIANTS: Record<KycStatus, BadgeVariant> = {
  verified: "secondary",
  pending: "destructive",
  rejected: "outline",
};

export function KycBadge({ status }: { status: KycStatus }) {
  return (
    <Badge variant={VARIANTS[status]} className="capitalize">
      {status}
    </Badge>
  );
}
