import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DEFAULT_DIRECTION,
  DEFAULT_SORT,
  type SortColumn,
  type SortDirection,
} from "@/lib/customer-list";

export function CustomerPagination({
  page,
  pageCount,
  total,
  search,
  sort,
  direction,
}: {
  page: number;
  pageCount: number;
  total: number;
  search: string;
  sort: SortColumn;
  direction: SortDirection;
}) {
  function pageHref(target: number) {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (sort !== DEFAULT_SORT) params.set("sort", sort);
    if (direction !== DEFAULT_DIRECTION) params.set("dir", direction);
    if (target > 1) params.set("page", String(target));

    const query = params.toString();
    return query ? `/?${query}` : "/";
  }

  return (
    <nav aria-label="Pagination" className="mt-4 flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Page {page} of {pageCount} · {total} {total === 1 ? "customer" : "customers"}
      </p>

      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Button asChild variant="outline">
            <Link href={pageHref(page - 1)}>
              <ChevronLeftIcon data-icon="inline-start" />
              Previous
            </Link>
          </Button>
        ) : (
          <Button variant="outline" disabled>
            <ChevronLeftIcon data-icon="inline-start" />
            Previous
          </Button>
        )}

        {page < pageCount ? (
          <Button asChild variant="outline">
            <Link href={pageHref(page + 1)}>
              Next
              <ChevronRightIcon data-icon="inline-end" />
            </Link>
          </Button>
        ) : (
          <Button variant="outline" disabled>
            Next
            <ChevronRightIcon data-icon="inline-end" />
          </Button>
        )}
      </div>
    </nav>
  );
}
