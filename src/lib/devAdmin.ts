import { tokenService } from "./tokenService";

/**
 * Development utility to enable admin access
 * Only works in development/localhost
 */
export const enableDevAdmin = () => {
  if (typeof window === "undefined") return;
  if (window.location.hostname !== "localhost") return;

  // Set a dummy token - backend will accept it in dev mode
  const devAccessToken = "dev_admin_token_" + Date.now();
  const devRefreshToken = "dev_refresh_token_" + Date.now();

  tokenService.setTokens(devAccessToken, devRefreshToken);
  localStorage.setItem("isAdmin", "true");
  localStorage.setItem("adminEmail", "admin@clickcard.com");

  console.log(
    "%c✨ Admin Mode Enabled",
    "color: #BE5103; font-weight: bold; font-size: 14px;"
  );
  console.log(
    "%cMaking requests to /api/admin endpoints...",
    "color: #069494; font-size: 12px;"
  );
};

/**
 * Logout from dev admin
 */
export const disableDevAdmin = () => {
  tokenService.clear();
  localStorage.removeItem("isAdmin");
  localStorage.removeItem("adminEmail");
  console.log(
    "%c✋ Admin Mode Disabled",
    "color: #666; font-weight: bold; font-size: 14px;"
  );
};
