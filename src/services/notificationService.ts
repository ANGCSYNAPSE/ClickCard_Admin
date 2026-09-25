import { apiClient } from "@/lib/axiosClient";
import { NOTIFICATION_ROUTES } from "@/apiRoutes";
import type { ApiResponse } from "@/types";

export interface AppNotification {
  id: number;
  type: string;
  title: string;
  message?: string | null;
  data?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

/**
 * Admin notifications. The backend wraps payloads as { success, data },
 * so every method unwraps `res.data.data` here — callers get plain values.
 */
export const notificationService = {
  /** All of the signed-in admin's notifications (latest 30) + unread count. */
  list: async (): Promise<{ items: AppNotification[]; unread: number }> => {
    const { data } = await apiClient.get<
      ApiResponse<{ items: AppNotification[]; unread: number }>
    >(NOTIFICATION_ROUTES.list);
    return {
      items: data.data?.items ?? [],
      unread: data.data?.unread ?? 0,
    };
  },

  /** New-user registration notifications only. */
  adminRegistrations: async (): Promise<AppNotification[]> => {
    const { data } = await apiClient.get<
      ApiResponse<{ items: AppNotification[] }>
    >(NOTIFICATION_ROUTES.adminRegistrations);
    return data.data?.items ?? [];
  },

  markRead: (id: number) =>
    apiClient.patch<ApiResponse>(NOTIFICATION_ROUTES.read(id)),

  markAllRead: () => apiClient.patch<ApiResponse>(NOTIFICATION_ROUTES.readAll),
};

/** "just now", "5m ago", "3h ago", "2d ago", then a date. */
export const timeAgo = (iso: string): string => {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const s = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
};

/** Where clicking a notification should take the admin, by type. */
export const notificationHref = (n: AppNotification): string | null => {
  const userId = n.data?.userId;
  switch (n.type) {
    case "new_user":
      return userId ? `/users/${userId}` : "/users";
    case "new_lead":
      return "/support";
    case "moderation":
      return "/moderation";
    default:
      return null;
  }
};
