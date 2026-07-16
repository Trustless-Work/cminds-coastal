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
import { Textarea } from "@repo/ui/components/textarea";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { IconActionButton } from "@repo/ui/components/icon-action-button";
import { ClipboardList, Loader2 } from "lucide-react";
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
  const { form, handleSubmit, isSubmitting } = useChangeMilestoneStatus({
    onSuccess: () => setIsOpen(false),
  });
  const { selectedEscrow } = useEscrowContext();

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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Task Status</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col space-y-6 w-full"
          >
            <div
              className={`grid grid-cols-1 ${
                showSelectMilestone ? "lg:grid-cols-2" : "lg:grid-cols-1"
              } gap-4`}
            >
              {showSelectMilestone && (
                <FormField
                  control={form.control}
                  name="milestoneIndex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        Task
                        <span className="text-destructive ml-1">*</span>
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
                      Status<span className="text-destructive ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter new status" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="evidence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Evidence</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter evidence (optional)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
      </DialogContent>
      </Dialog>
    </>
  );
};
