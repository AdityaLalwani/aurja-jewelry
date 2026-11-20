"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

export function LoginPrompt({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const hasPrompted = useRef(false);

  useEffect(() => {
    if (
      isAuthenticated ||
      hasPrompted.current ||
      pathname === "/login" ||
      pathname === "/signup" ||
      pathname === "/profile" ||
      pathname.startsWith("/admin")
    ) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      hasPrompted.current = true;
      router.push("/login");
    }, 5000);

    return () => window.clearTimeout(timeoutId);
  }, [isAuthenticated, pathname, router]);

  return null;
}
