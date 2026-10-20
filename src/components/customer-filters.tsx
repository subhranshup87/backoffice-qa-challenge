"use client";

import { XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEFAULT_DIRECTION,
  DEFAULT_SORT,
  STATUS_FILTERS,
  type SortColumn,
  type SortDirection,
  type StatusFilter,
} from "@/lib/customer-list";

const STATUS_LABELS: Record<StatusFilter, string> = {
  all: "All",
  verified: "Verified",
  pending: "Pending",
  rejected: "Rejected",
};

export function CustomerFilters({
  search: initialSearch,
  status: initialStatus,
  sort,
  direction,
}: {
  search: string;
  status: StatusFilter;
  sort: SortColumn;
  direction: SortDirection;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus);

  // Changing a filter always returns to the first page: the operator's old page
  // number means nothing against a different set of results.
  function apply(next: { search: string; status: StatusFilter }) {
    const params = new URLSearchParams();
    if (next.search) params.set("q", next.search);
    if (next.status !== "all") params.set("status", next.status);
    if (sort !== DEFAULT_SORT) params.set("sort", sort);
    if (direction !== DEFAULT_DIRECTION) params.set("dir", direction);

    const query = params.toString();
    router.push(query ? `/?${query}` : "/");
  }

  function selectStatus(value: string) {
    const next = value as StatusFilter;
    setStatus(next);
    apply({ search, status: next });
  }

  function clearStatus() {
    selectStatus("all");
  }

  return (
    <div className="mb-6 flex flex-wrap items-end gap-4">
      <form
        className="flex items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          apply({ search, status });
        }}
      >
        <div className="grid gap-1.5">
          <Label htmlFor="customer-search">Search</Label>
          <Input
            id="customer-search"
            name="q"
            className="w-64"
            placeholder="Name or email"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      <div className="grid gap-1.5">
        <Label htmlFor="kyc-status">KYC status</Label>
        <Select value={status} onValueChange={selectStatus}>
          <SelectTrigger id="kyc-status" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((option) => (
              <SelectItem key={option} value={option}>
                {STATUS_LABELS[option]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {status === "all" ? null : (
        <Badge variant="outline" className="h-8 gap-1 px-2.5">
          KYC: {STATUS_LABELS[status]}
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={`Clear the ${STATUS_LABELS[status]} KYC filter`}
            onClick={clearStatus}
          >
            <XIcon />
          </Button>
        </Badge>
      )}
    </div>
  );
}
