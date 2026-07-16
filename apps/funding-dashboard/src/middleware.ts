import { createI18nMiddleware } from "@repo/i18n/middleware";

export default createI18nMiddleware();

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
