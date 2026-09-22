import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { tokenService } from "./tokenService";

/** Gate admin pages; bounce guests to /login. Returns readiness flag. */
export function useRequireAdminAuth() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!router.isReady || !mounted) return;

    const hasToken = tokenService.isAuthenticated();
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    if (!hasToken || !isAdmin) {
      router.replace(`/login?redirect=${encodeURIComponent(router.asPath)}`);
    }
  }, [router, mounted]);

  return { ready: mounted && tokenService.isAuthenticated() && localStorage.getItem("isAdmin") === "true" };
}
