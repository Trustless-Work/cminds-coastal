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
import { useChangeMilestoneStatus } from "../shared/useChangeMilestoneStatus";
import { Loader2, Plus, X } from "lucide-react";
import { useEscrowContext } from "@repo/providers/EscrowProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";

export const ChangeMilestoneStatusForm = () => {
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
  } = useChangeMilestoneStatus();
  const { selectedEscrow } = useEscrowContext();
  const evidenceUrls = form.watch("evidenceUrls") ?? [];
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="flex w-full flex-col space-y-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <FormField
            control={form.control}
            name="milestoneIndex"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  Task<span className="ml-1 text-destructive">*</span>
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
                      {(selectedEscrow?.milestones || []).map((m, idx) => (
                        <SelectItem key={`ms-${idx}`} value={String(idx)}>
                          {m?.description || `Task ${idx + 1}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  Status<span className="ml-1 text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter new status" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium">Upload files (max {maxFiles})</p>
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
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting || files.length >= maxFiles}
            onClick={() => fileInputRef.current?.click()}
          >
            Choose files
          </Button>
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between gap-2 text-sm"
            >
              <span className="truncate">
                Uploaded file · {file.name}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeFile(index)}
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium">
            External URLs (max {maxUrls})
          </p>
          <div className="flex gap-2">
            <Input
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              placeholder="https://…"
            />
            <Button type="button" variant="outline" onClick={addUrl}>
              <Plus className="size-4" />
            </Button>
          </div>
          {evidenceUrls.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="flex items-center justify-between gap-2 text-sm"
            >
              <span className="truncate">External link · {url}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeUrl(index)}
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}
        </div>

        {uploadProgress ? (
          <p className="text-sm text-muted-foreground">{uploadProgress}</p>
        ) : null}

        <div className="mt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="cursor-pointer"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="ml-2">Updating...</span>
              </div>
            ) : (
              "Update"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
