/**
 * Central registry of every backend endpoint the admin panel calls.
 * Swap paths here in one place when the Swagger contract changes.
 * Base URL is configured via NEXT_PUBLIC_API_BASE_URL (see axiosClient).
 */

export const AUTH_ROUTES = {
  loginInitiate: "/api/users/login/initiate",
  loginVerify: "/api/users/login/verify",
  refreshToken: "/api/users/refresh-token",
  logout: "/api/users/logout",
  adminLogin: "/api/users/admin/login",
} as const;

export const USER_ROUTES = {
  current: "/api/users/current",
} as const;

export const NOTIFICATION_ROUTES = {
  adminRegistrations: "/api/notifications/admin/registrations",
} as const;

export const ADMIN_ROUTES = {
  stats: "/api/admin/stats",
  revenue: "/api/admin/revenue",
  users: "/api/admin/users",
  userDetails: (userId: string) => `/api/admin/users/${userId}`,
  userAnalytics: (userId: string) => `/api/admin/users/${userId}/analytics`,
  userBlock: (userId: string) => `/api/admin/users/${userId}/block`,
  userModerate: (userId: string) => `/api/admin/users/${userId}/moderate`,
  leads: "/api/admin/leads",
  subscriptionPlans: "/api/admin/subscriptions/plans",
  subscriptionUsers: "/api/admin/subscriptions/users",
  settings: "/api/admin/settings",
  team: "/api/users/admin",
  teamMember: (adminId: string) => `/api/users/admin/${adminId}`,
} as const;
