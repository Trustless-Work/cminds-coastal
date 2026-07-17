"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  decodeEvidenceRefs,
  parseLegacyEvidenceLinks,
} from "@repo/helpers";
import {
  resolveEvidenceRefs,
  type EvidenceRefRecord,
} from "@repo/features/escrow/services/evidence.service";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { IconActionButton } from "@repo/ui/components/icon-action-button";
import { TooltipProvider } from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/utils";
import {
  Download,
  ExternalLink,
  Eye,
  FileText,
  FileType2,
  ImageIcon,
  Link2,
  Loader2,
  Paperclip,
} from "lucide-react";

type EvidenceItem = {
  id: string;
  kind: "file" | "url";
  url: string;
  filename: string;
  mime_type: string | null;
};

type EvidenceLinksProps = {
  evidence: string | undefined | null;
  className?: string;
  /** Prefer placing this in the task actions row with other IconActionButtons. */
  variant?: "icon" | "button";
};

function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Link";
  }
}

function filenameFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname;
    const last = path.split("/").filter(Boolean).pop();
    if (last && last.includes(".")) return decodeURIComponent(last);
  } catch {
    // ignore
  }
  return getHostname(url);
}

function isImageMime(mime: string | null, url: string, filename: string): boolean {
  if (mime?.startsWith("image/")) return true;
  return /\.(jpe?g|png|gif|webp|avif|svg)(\?|$)/i.test(filename || url);
}

function isPdfMime(mime: string | null, url: string, filename: string): boolean {
  if (mime === "application/pdf") return true;
  return /\.pdf(\?|$)/i.test(filename || url);
}

function kindLabel(item: EvidenceItem): string {
  if (item.kind === "url") return "External link";
  if (isImageMime(item.mime_type, item.url, item.filename)) return "Image";
  if (isPdfMime(item.mime_type, item.url, item.filename)) return "PDF";
  return "File";
}

function toItemsFromRefs(refs: EvidenceRefRecord[]): EvidenceItem[] {
  return refs
    .filter((ref) => Boolean(ref.url))
    .map((ref) => ({
      id: ref.id,
      kind: ref.kind,
      url: ref.url,
      filename:
        ref.filename?.trim() ||
        (ref.kind === "url" ? filenameFromUrl(ref.url) : `evidence-${ref.id}`),
      mime_type: ref.mime_type,
    }));
}

function toItemsFromLegacy(urls: string[]): EvidenceItem[] {
  return urls.map((url, index) => ({
    id: `legacy-${index}`,
    kind: "url" as const,
    url,
    filename: filenameFromUrl(url),
    mime_type: null,
  }));
}

async function downloadFile(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) throw new Error("Fetch failed");
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

const EvidencePreviewCard = ({
  item,
  onDownload,
  downloading,
}: {
  item: EvidenceItem;
  onDownload: () => void;
  downloading: boolean;
}) => {
  const isImage = isImageMime(item.mime_type, item.url, item.filename);
  const isPdf = isPdfMime(item.mime_type, item.url, item.filename);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-[#F8F8F8] ring-1 ring-[#ECECEC] transition-shadow hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
      <a
        href={item.url}
        target="_blank"
        rel="noreferrer"
        className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[#F3F3F3] outline-none focus-visible:ring-2 focus-visible:ring-[#111111]/40"
        aria-label={`Open ${item.filename}`}
      >
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.url}
            alt={item.filename}
            className="size-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          />
        ) : item.kind === "url" ? (
          <Link2 className="size-10 text-[#666666]" strokeWidth={1.5} />
        ) : isPdf ? (
          <FileText className="size-10 text-[#666666]" strokeWidth={1.5} />
        ) : (
          <FileType2 className="size-10 text-[#666666]" strokeWidth={1.5} />
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity group-hover:bg-black/25 group-hover:opacity-100">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#111111] shadow-sm">
            <Eye className="size-3.5" />
            Open
          </span>
        </span>
      </a>
      <div className="flex items-start gap-2 border-t border-[#ECECEC] bg-white px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <p
            className="truncate text-sm font-medium text-[#111111]"
            title={item.filename}
          >
            {item.filename}
          </p>
          <p className="truncate text-xs text-[#666666]">
            {kindLabel(item)}
            {item.mime_type ? ` · ${item.mime_type}` : ""}
          </p>
        </div>
        {item.kind === "file" ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onDownload();
            }}
            disabled={downloading}
            aria-label={`Download ${item.filename}`}
          >
            {downloading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Download className="size-3.5" />
            )}
          </Button>
        ) : (
          <ExternalLink className="mt-0.5 size-3.5 shrink-0 text-[#B3B3B3]" />
        )}
      </div>
    </div>
  );
};

export const EvidenceLinks = ({
  evidence,
  className,
  variant = "icon",
}: EvidenceLinksProps) => {
  const [open, setOpen] = React.useState(false);
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);
  const [downloadingAll, setDownloadingAll] = React.useState(false);

  const encoded = decodeEvidenceRefs(evidence);
  const legacyUrls = parseLegacyEvidenceLinks(evidence);

  const resolveQuery = useQuery({
    queryKey: ["evidence", "resolve", encoded.map((r) => r.id).join("&")],
    queryFn: () => resolveEvidenceRefs(encoded.map((r) => r.id)),
    enabled: encoded.length > 0 && open,
  });

  const items = React.useMemo((): EvidenceItem[] => {
    if (encoded.length > 0) {
      return toItemsFromRefs(resolveQuery.data ?? []);
    }
    return toItemsFromLegacy(parseLegacyEvidenceLinks(evidence));
  }, [encoded.length, evidence, resolveQuery.data]);

  const unresolvedEncoded =
    encoded.length > 0 &&
    !resolveQuery.isLoading &&
    !resolveQuery.isFetching &&
    items.length === 0;

  const downloadableFiles = items.filter((item) => item.kind === "file");

  async function handleDownloadOne(item: EvidenceItem): Promise<void> {
    if (item.kind !== "file") return;
    setDownloadingId(item.id);
    try {
      await downloadFile(item.url, item.filename);
    } finally {
      setDownloadingId(null);
    }
  }

  async function handleDownloadAll(): Promise<void> {
    if (downloadableFiles.length === 0) return;
    setDownloadingAll(true);
    try {
      for (const item of downloadableFiles) {
        setDownloadingId(item.id);
        await downloadFile(item.url, item.filename);
        await new Promise((resolve) => setTimeout(resolve, 350));
      }
    } finally {
      setDownloadingId(null);
      setDownloadingAll(false);
    }
  }

  if (!evidence?.trim()) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        No Evidence Yet
      </p>
    );
  }

  // Encoded refs or legacy URLs — show trigger. Free-form non-link text falls through.
  if (encoded.length === 0 && legacyUrls.length === 0) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        Evidence on file
      </p>
    );
  }

  return (
    <div className={cn(className)}>
      {variant === "icon" ? (
        <TooltipProvider delay={200}>
          <IconActionButton
            label="Show Evidence"
            icon={<Paperclip className="size-4" />}
            onClick={() => setOpen(true)}
          />
        </TooltipProvider>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="cursor-pointer gap-2"
          onClick={() => setOpen(true)}
        >
          <Paperclip className="size-4" />
          Show Evidence
          {(encoded.length > 0 ? encoded.length : legacyUrls.length) > 0 ? (
            <span className="rounded-full bg-[#F3F3F3] px-2 py-0.5 text-xs text-[#666666]">
              {encoded.length > 0 ? encoded.length : legacyUrls.length}
            </span>
          ) : null}
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="!w-full max-h-[95vh] overflow-y-auto sm:!max-w-3xl md:!max-w-4xl">
          <DialogHeader>
            <DialogTitle>Task Evidence</DialogTitle>
            <DialogDescription>
              Preview attached files and links. Open any item in a new tab.
              Uploaded files can be downloaded individually or all at once.
            </DialogDescription>
          </DialogHeader>

          {encoded.length > 0 &&
          (resolveQuery.isLoading || resolveQuery.isFetching) ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-[#666666]">
              <Loader2 className="size-5 animate-spin" />
              Loading evidence…
            </div>
          ) : unresolvedEncoded ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <ImageIcon className="size-8 text-[#B3B3B3]" strokeWidth={1.5} />
              <p className="text-sm text-[#666666]">
                Evidence refs on-chain could not be resolved.
              </p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <Paperclip className="size-8 text-[#B3B3B3]" strokeWidth={1.5} />
              <p className="text-sm text-[#666666]">No evidence items found.</p>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {items.map((item) => (
                <li key={item.id}>
                  <EvidencePreviewCard
                    item={item}
                    onDownload={() => void handleDownloadOne(item)}
                    downloading={
                      downloadingAll || downloadingId === item.id
                    }
                  />
                </li>
              ))}
            </ul>
          )}

          <DialogFooter className="-mx-0 -mb-0 rounded-none border-t border-[#ECECEC] bg-transparent px-0 pt-4 sm:justify-between">
            <p className="text-xs text-[#666666]">
              {items.length > 0
                ? `${items.length} item${items.length === 1 ? "" : "s"}`
                : null}
            </p>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => setOpen(false)}
              >
                Close
              </Button>
              {downloadableFiles.length > 0 ? (
                <Button
                  type="button"
                  className="cursor-pointer gap-2"
                  disabled={downloadingAll}
                  onClick={() => void handleDownloadAll()}
                >
                  {downloadingAll ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Download className="size-4" />
                  )}
                  Download All
                </Button>
              ) : null}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export function hasResolvableEvidence(
  evidence: string | undefined | null,
): boolean {
  if (!evidence?.trim()) return false;
  return (
    decodeEvidenceRefs(evidence).length > 0 ||
    parseLegacyEvidenceLinks(evidence).length > 0
  );
}
