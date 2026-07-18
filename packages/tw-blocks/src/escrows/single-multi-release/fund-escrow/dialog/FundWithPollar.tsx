import * as React from "react";
import { formatAddress } from "@repo/helpers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Button } from "@repo/ui/components/button";
import { Loader2, Sparkles } from "lucide-react";
import { useFundWithPollar } from "../shared/useFundWithPollar";

export const FundWithPollarDialog = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { form, handleSubmit, isSubmitting, walletAddress } = useFundWithPollar(
    { onSuccess: () => setIsOpen(false) },
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="w-full">
          <Sparkles className="size-4" />
          Fund with Pollar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Fund with Pollar</DialogTitle>
          <DialogDescription>
            Contribute USDC directly from your Pollar wallet
            {walletAddress ? (
              <>
                {" "}
                <span className="font-mono text-foreground">
                  {formatAddress(walletAddress, 4)}
                </span>
              </>
            ) : null}
            .
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (USDC)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="0.01"
                      placeholder="Enter amount"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Funding…
                </>
              ) : (
                "Fund"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
