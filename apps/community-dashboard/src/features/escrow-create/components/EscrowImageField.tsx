"use client";

import { useEffect, useState } from "react";
import { ImageIcon, X } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Label } from "@repo/ui/components/label";
import { cn } from "@repo/ui/lib/utils";

type EscrowImageFieldProps = {
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string;
};

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

export const EscrowImageField = ({
  file,
  onChange,
  error,
}: EscrowImageFieldProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="space-y-2">
      <Label htmlFor="escrow-image">Escrow Image</Label>
      <p className="text-sm text-muted-foreground">
        Cover photo stored in Supabase (jpeg, png, webp, or gif · max 5MB).
      </p>

      {previewUrl ? (
        <div className="relative overflow-hidden rounded-xl ring-1 ring-foreground/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Escrow preview"
            className="aspect-video w-full object-cover"
          />
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            className="absolute top-2 right-2"
            onClick={() => onChange(null)}
            aria-label="Remove image"
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <label
          htmlFor="escrow-image"
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-10 text-center transition-colors hover:bg-muted/40",
            error && "border-destructive",
          )}
        >
          <ImageIcon className="size-8 text-muted-foreground" />
          <span className="text-sm font-medium">Choose An Image</span>
          <span className="text-xs text-muted-foreground">
            Click to browse your files
          </span>
        </label>
      )}

      <input
        id="escrow-image"
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={(event) => {
          const next = event.target.files?.[0] ?? null;
          onChange(next);
          event.target.value = "";
        }}
      />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
};
