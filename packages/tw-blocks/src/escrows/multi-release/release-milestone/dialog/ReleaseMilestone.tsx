import * as React from "react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@repo/ui/components/form";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import { Loader2 } from "lucide-react";
import { useReleaseMilestone } from "../shared/useReleaseMilestone";
import { useEscrowContext } from "@repo/providers/EscrowProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";

export const ReleaseMilestoneDialog = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { form, handleSubmit, isSubmitting } = useReleaseMilestone({
    onSuccess: () => setIsOpen(false),
  });
  const { selectedEscrow } = useEscrowContext();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button type="button" className="cursor-pointer w-full">
          Release Task
        </Button>
      </DialogTrigger>
      <DialogContent className="!w-full sm:!max-w-md">
        <DialogHeader>
          <DialogTitle>Release Task</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit}>
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

            <div className="mt-4 flex justify-start items-center">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="ml-2">Releasing...</span>
                  </div>
                ) : (
                  "Release Task"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
