import { LoginShell } from "@repo/shared/LoginShell";
import type { ReactNode } from "react";

type AuthLoginShellProps = {
  children: ReactNode;
  imageAlt?: string;
};

export function AuthLoginShell({
  children,
  imageAlt = "Coastal conservation — administration",
}: AuthLoginShellProps) {
  return (
    <LoginShell
      imageSrc="/logos/assets/auth.webp"
      imageAlt={imageAlt}
      logoSrc="/logos/dark-en-logo.png"
      showFooter={false}
    >
      {children}
    </LoginShell>
  );
}
