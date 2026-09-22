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

export const notificationService = {
  adminRegistrations: () =>
    apiClient.get<ApiResponse<{ items: AppNotification[] }>>(
      NOTIFICATION_ROUTES.adminRegistrations,
    ),
};
