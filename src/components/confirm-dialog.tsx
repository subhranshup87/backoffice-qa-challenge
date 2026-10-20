"use client";

import { XIcon } from "lucide-react";
import { useEffect, useId, useRef } from "react";

import { Button } from "@/components/ui/button";

/** The confirmation an irreversible action goes behind. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const dialog = useRef<HTMLDivElement>(null);
  const cancel = useRef(onCancel);

  useEffect(() => {
    cancel.current = onCancel;
  }, [onCancel]);

  // Escape cancels, the dialog takes focus when it opens, and whatever was
  // focused before gets it back when the dialog goes away.
  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialog.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") cancel.current();
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 p-4">
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className="relative flex w-full max-w-sm flex-col gap-4 rounded-xl whitespace-normal bg-popover p-4 text-left text-sm text-popover-foreground ring-1 ring-foreground/10 outline-none"
      >
        <Button
          variant="ghost"
          size="icon-sm"
          className="absolute top-2 right-2"
          onClick={onCancel}
        >
          <XIcon />
        </Button>

        <h2 id={titleId} className="text-base leading-none font-medium">
          {title}
        </h2>
        <p id={descriptionId} className="text-muted-foreground">
          {description}
        </p>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
