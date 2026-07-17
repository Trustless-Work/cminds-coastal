import * as React from "react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
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
import {
  ClipboardList,
  FileText,
  FileType2,
  ImageIcon,
  Link2,
  Loader2,
  Plus,
  Upload,
  X,
} from "lucide-react";
import { useChangeMilestoneStatus } from "../shared/useChangeMilestoneStatus";
import { useEscrowContext } from "@repo/providers/EscrowProvider";
import type { MultiReleaseMilestone } from "@trustless-work/escrow/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { cn } from "@repo/ui/lib/utils";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

function getFileKindLabel(file: File): string {
  if (file.type.startsWith("image/")) return "Image";
  if (file.type === "application/pdf") return "PDF";
  if (
    file.type.includes("word") ||
    file.name.endsWith(".doc") ||
    file.name.endsWith(".docx")
  ) {
    return "Document";
  }
  if (file.type === "text/plain") return "Text";
  return "File";
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Link";
  }
}

const EvidenceFileCard = ({
  file,
  onRemove,
  disabled,
}: {
  file: File;
  onRemove: () => void;
  disabled?: boolean;
}) => {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const isImage = isImageFile(file);

  React.useEffect(() => {
    if (!isImage) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file, isImage]);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-[#F8F8F8] ring-1 ring-[#ECECEC] transition-shadow hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[#F3F3F3]">
        {isImage && previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt={file.name}
            className="size-full object-cover"
          />
        ) : file.type === "application/pdf" ? (
          <FileText className="size-10 text-[#666666]" strokeWidth={1.5} />
        ) : (
          <FileType2 className="size-10 text-[#666666]" strokeWidth={1.5} />
        )}
        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          className="absolute top-2 right-2 opacity-100 shadow-sm sm:opacity-0 sm:group-hover:opacity-100"
          onClick={onRemove}
          disabled={disabled}
          aria-label={`Remove ${file.name}`}
        >
          <X className="size-3.5" />
        </Button>
      </div>
      <div className="flex flex-col gap-0.5 border-t border-[#ECECEC] bg-white px-3 py-2.5">
        <p className="truncate text-sm font-medium text-[#111111]" title={file.name}>
          {file.name}
        </p>
        <p className="truncate text-xs text-[#666666]">
          {getFileKindLabel(file)} · {formatFileSize(file.size)}
        </p>
      </div>
    </div>
  );
};

const EvidenceUrlCard = ({
  url,
  onRemove,
  disabled,
}: {
  url: string;
  onRemove: () => void;
  disabled?: boolean;
}) => {
  return (
    <div className="group relative flex items-start gap-3 overflow-hidden rounded-2xl bg-white px-3 py-3 ring-1 ring-[#ECECEC] transition-shadow hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#F3F3F3]">
        <Link2 className="size-5 text-[#666666]" strokeWidth={1.5} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#111111]">
          {getHostname(url)}
        </p>
        <p className="truncate text-xs text-[#666666]" title={url}>
          {url}
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="shrink-0"
        onClick={onRemove}
        disabled={disabled}
        aria-label="Remove URL"
      >
        <X className="size-3.5" />
      </Button>
    </div>
  );
};

export const ChangeMilestoneStatusDialog = ({
  showSelectMilestone = false,
  milestoneIndex,
  renderTrigger,
}: {
  showSelectMilestone?: boolean;
  milestoneIndex?: number | string;
  renderTrigger?: (open: () => void) => React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const {
    form,
    handleSubmit,
    isSubmitting,
    files,
    addFiles,
    removeFile,
    urlDraft,
    setUrlDraft,
    addUrl,
    removeUrl,
    uploadProgress,
    acceptedFileTypes,
    maxFiles,
    maxUrls,
  } = useChangeMilestoneStatus({
    onSuccess: () => setIsOpen(false),
  });
  const { selectedEscrow } = useEscrowContext();
  const evidenceUrls = form.watch("evidenceUrls") ?? [];
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (
      !showSelectMilestone &&
      milestoneIndex !== undefined &&
      milestoneIndex !== null
    ) {
      form.setValue("milestoneIndex", String(milestoneIndex));
    }
  }, [showSelectMilestone, milestoneIndex, form]);

  function openDialog(): void {
    setIsOpen(true);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    setIsDragging(false);
    if (isSubmitting || files.length >= maxFiles) return;
    if (event.dataTransfer.files?.length) {
      addFiles(event.dataTransfer.files);
    }
  }

  return (
    <>
      {renderTrigger ? (
        renderTrigger(openDialog)
      ) : (
        <IconActionButton
          label="Update Status"
          icon={<ClipboardList className="size-4" />}
          onClick={openDialog}
        />
      )}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="!w-full max-h-[95vh] overflow-y-auto sm:!max-w-3xl md:!max-w-4xl">
          <DialogHeader>
            <DialogTitle>Change Task Status</DialogTitle>
            <DialogDescription>
              Update the milestone status and attach evidence for CMinds
              review.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={handleSubmit}
              className="flex w-full flex-col gap-8"
            >
              <div
                className={cn(
                  "grid grid-cols-1 gap-4",
                  showSelectMilestone ? "sm:grid-cols-2" : "sm:grid-cols-1",
                )}
              >
                {showSelectMilestone && (
                  <FormField
                    control={form.control}
                    name="milestoneIndex"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          Task
                          <span className="ml-1 text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={(e) => {
                              field.onChange(e);
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select task" />
                            </SelectTrigger>
                            <SelectContent>
                              {(selectedEscrow?.milestones || []).map(
                                (m, idx) => {
                                  const isReleased =
                                    "flags" in m &&
                                    Boolean(
                                      (m as MultiReleaseMilestone).flags
                                        ?.released,
                                    );
                                  if (isReleased) return null;
                                  return (
                                    <SelectItem
                                      key={`ms-${idx}`}
                                      value={String(idx)}
                                    >
                                      {m?.description || `Task ${idx + 1}`}
                                    </SelectItem>
                                  );
                                },
                              )}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        Status
                        <span className="ml-1 text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Ready for Review"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-[#111111]">
                    Upload evidence
                  </p>
                  <p className="text-xs text-[#666666]">
                    Images, PDF, or documents — max {maxFiles} files · 5MB each
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={acceptedFileTypes}
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    if (event.target.files?.length) {
                      addFiles(event.target.files);
                      event.target.value = "";
                    }
                  }}
                />

                <div
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  onClick={() => {
                    if (!isSubmitting && files.length < maxFiles) {
                      fileInputRef.current?.click();
                    }
                  }}
                  onDragEnter={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={(event) => {
                    event.preventDefault();
                    setIsDragging(false);
                  }}
                  onDrop={handleDrop}
                  className={cn(
                    "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-6 py-10 text-center transition-colors",
                    isDragging
                      ? "border-[#111111] bg-[#F3F3F3]"
                      : "border-[#ECECEC] bg-[#F8F8F8] hover:bg-[#F3F3F3]",
                    (isSubmitting || files.length >= maxFiles) &&
                      "pointer-events-none opacity-50",
                  )}
                >
                  <div className="flex size-12 items-center justify-center rounded-full bg-white ring-1 ring-[#ECECEC]">
                    {isDragging ? (
                      <ImageIcon className="size-5 text-[#111111]" />
                    ) : (
                      <Upload className="size-5 text-[#666666]" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-[#111111]">
                      {isDragging
                        ? "Drop files to upload"
                        : "Drag & drop files here"}
                    </p>
                    <p className="text-xs text-[#666666]">
                      or click to browse · {files.length}/{maxFiles} selected
                    </p>
                  </div>
                </div>

                {files.length > 0 ? (
                  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {files.map((file, index) => (
                      <li key={`${file.name}-${file.size}-${index}`}>
                        <EvidenceFileCard
                          file={file}
                          onRemove={() => removeFile(index)}
                          disabled={isSubmitting}
                        />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-[#111111]">
                    External evidence URLs
                  </p>
                  <p className="text-xs text-[#666666]">
                    Google Drive or other links — max {maxUrls}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={urlDraft}
                    onChange={(event) => setUrlDraft(event.target.value)}
                    placeholder="https://…"
                    disabled={isSubmitting || evidenceUrls.length >= maxUrls}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addUrl();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0 cursor-pointer"
                    onClick={addUrl}
                    disabled={isSubmitting || evidenceUrls.length >= maxUrls}
                  >
                    <Plus className="size-4" />
                    <span className="sr-only sm:not-sr-only sm:ml-1">Add</span>
                  </Button>
                </div>
                {evidenceUrls.length > 0 ? (
                  <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {evidenceUrls.map((url, index) => (
                      <li key={`${url}-${index}`}>
                        <EvidenceUrlCard
                          url={url}
                          onRemove={() => removeUrl(index)}
                          disabled={isSubmitting}
                        />
                      </li>
                    ))}
                  </ul>
                ) : null}
                <FormField
                  control={form.control}
                  name="evidenceUrls"
                  render={() => <FormMessage />}
                />
              </div>

              {uploadProgress ? (
                <p className="text-sm text-[#666666]">{uploadProgress}</p>
              ) : null}

              <DialogFooter className="-mx-0 -mb-0 rounded-none border-t-0 bg-transparent p-0 sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                  disabled={isSubmitting}
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="ml-2">
                        {uploadProgress ? "Uploading…" : "Updating…"}
                      </span>
                    </div>
                  ) : (
                    "Update Status"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};
