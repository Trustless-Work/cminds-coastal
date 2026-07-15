import { toast } from "sonner";

/** Success toast — Title Case title + sentence-case description. */
export function toastSuccess(title: string, description: string): string | number {
  return toast.success(title, { description });
}

/** Error toast — Title Case title + sentence-case description. */
export function toastError(title: string, description: string): string | number {
  return toast.error(title, { description });
}
