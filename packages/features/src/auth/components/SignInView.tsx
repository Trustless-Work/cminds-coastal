"use client";

import { usePollar } from "@pollar/react";
import { shortenStellarAddress } from "@repo/helpers";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
} from "@repo/ui/components/field";
import { cn } from "@repo/ui/lib/utils";

type SignInViewProps = React.ComponentProps<"div">;

export function SignInView({ className, ...props }: SignInViewProps) {
  const { isAuthenticated, wallet, login, logout } = usePollar();
  const address = wallet?.address ?? "";

  if (isAuthenticated && address) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <div className="flex flex-col justify-center gap-6 p-6 md:p-8">
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">Signed in</h1>
                  <p className="text-sm text-balance text-muted-foreground">
                    Connected as {shortenStellarAddress(address)}
                  </p>
                </div>
                <Field>
                  <Button
                    className="w-full"
                    variant="outline"
                    type="button"
                    onClick={() => logout()}
                  >
                    Sign out
                  </Button>
                </Field>
              </FieldGroup>
            </div>
            <div className="relative hidden bg-muted md:block">
              <img
                src="/placeholder.svg"
                alt=""
                className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-sm text-balance text-muted-foreground">
                  Continue with Google to access your Stellar wallet.
                </p>
              </div>
              <Field>
                <Button
                  className="w-full"
                  type="button"
                  onClick={() => login({ provider: "google" })}
                >
                  <GoogleIcon />
                  Continue with Google
                </Button>
              </Field>
            </FieldGroup>
          </div>
          <div className="relative hidden bg-muted md:block">
            <img
              src="/placeholder.svg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
        fill="currentColor"
      />
    </svg>
  );
}
