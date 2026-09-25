import { ReactNode, useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  BarChart3,
  Handshake,
  HelpCircle,
  Wallet,
  UserRoundCheck,
  Gift,
  UserPlus,
  MessageSquare,
  Flag,
  Megaphone,
} from "lucide-react";
import { useRouter } from "next/router";
import AdminThemeToggle from "./AdminThemeToggle";
import { tokenService } from "@/lib/tokenService";
import {
  notificationService,
  notificationHref,
  timeAgo,
  type AppNotification,
} from "@/services/notificationService";

/** Backend has no socket reach on serverless, so poll for new notifications. */
const NOTIFICATION_POLL_MS = 30_000;

const NOTIFICATION_ICONS: Record<string, { icon: typeof Bell; className: string }> = {
  new_user: { icon: UserPlus, className: "bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400" },
  new_lead: { icon: MessageSquare, className: "bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-[#22b8b0]" },
  moderation: { icon: Flag, className: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-brand-300" },
  announcement: { icon: Megaphone, className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400" },
};
const DEFAULT_NOTIFICATION_ICON = { icon: Bell, className: "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400" };

interface AdminShellProps {
  children: ReactNode;
}

export default function AdminShell({ children }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminEmail, setAdminEmail] = useState("Admin User");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [notificationsError, setNotificationsError] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchNotifications = useCallback(async () => {
    if (!tokenService.isAuthenticated()) return;
    try {
      const { items, unread } = await notificationService.list();
      setNotifications(items);
      setUnreadCount(unread);
      setNotificationsError(false);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setNotificationsError(true);
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  // Initial load, periodic polling, and refresh when the tab regains focus
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, NOTIFICATION_POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchNotifications();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [fetchNotifications]);

  // Close the dropdown on outside click
  useEffect(() => {
    if (!notificationOpen) return;
    const onClick = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [notificationOpen]);

  useEffect(() => {
    // Get admin email from localStorage
    const email = localStorage.getItem("adminEmail");
    if (email) {
      setAdminEmail(email);
    }

    // Get theme preference from localStorage
    const savedTheme = localStorage.getItem("adminTheme") as "light" | "dark" | null;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initialTheme = savedTheme || systemTheme;
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const applyTheme = (selectedTheme: "light" | "dark") => {
    if (selectedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("adminTheme", selectedTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  const isActive = (path: string) => router.pathname === path;

  const handleLogout = async () => {
    // Confirm logout
    if (!confirm("Are you sure you want to logout?")) return;

    try {
      // Clear tokens from cookies
      tokenService.clear();

      // Clear admin flags from localStorage
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("adminEmail");

      // Redirect to login
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const openNotification = (notif: AppNotification) => {
    if (!notif.is_read) {
      // Optimistic update; refetch to reconcile if the request fails
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      notificationService.markRead(notif.id).catch((err) => {
        console.error("Failed to mark notification as read:", err);
        fetchNotifications();
      });
    }
    const href = notificationHref(notif);
    if (href) {
      setNotificationOpen(false);
      router.push(href);
    }
  };

  const markAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    try {
      await notificationService.markAllRead();
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      fetchNotifications();
    }
  };

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/" },
    { name: "Users", icon: Users, href: "/users" },
    { name: "Revenue", icon: Wallet, href: "/revenue" },
    { name: "Subscriptions", icon: CreditCard, href: "/subscriptions" },
    { name: "Analytics", icon: BarChart3, href: "/analytics" },
    { name: "Referrals", icon: Gift, href: "/referrals" },
    { name: "Moderation", icon: UserRoundCheck, href: "/moderation" },
    { name: "Support", icon: HelpCircle, href: "/support" },
    { name: "Team", icon: Handshake, href: "/team" },
    { name: "Settings", icon: Settings, href: "/settings" },
  ];

  return (
    <div className="flex min-h-screen bg-paper dark:bg-dark">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white dark:bg-dark-hover border-r border-line dark:border-line/20 transition-all duration-300 fixed h-screen`}
      >
        <div className="p-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            {sidebarOpen && (
              <span className="text-xl font-black text-primary">CC</span>
            )}
            {sidebarOpen && (
              <span className="font-bold text-ink dark:text-white">Admin</span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-paper-soft dark:hover:bg-dark transition-colors"
          >
            {sidebarOpen ? (
              <X size={20} className="text-ink dark:text-white" />
            ) : (
              <Menu size={20} className="text-ink dark:text-white" />
            )}
          </button>
        </div>

        <nav className="mt-8 space-y-2 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-brand-300"
                    : "text-ink dark:text-white/70 hover:bg-paper-soft dark:hover:bg-dark"
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span className="font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-0 right-0 px-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-ink dark:text-white hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarOpen ? "ml-64" : "ml-20"} transition-all duration-300`}>
        {/* Top Bar */}
        <div className="bg-white dark:bg-dark-hover border-b border-line dark:border-line/20 sticky top-0 z-10">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search users, cards, transactions..."
                className="w-full max-w-md px-4 py-2 bg-paper-soft dark:bg-dark border border-line dark:border-line/20 rounded-lg text-ink dark:text-white placeholder-muted dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <AdminThemeToggle theme={theme} onToggle={toggleTheme} />

              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => {
                    if (!notificationOpen) fetchNotifications();
                    setNotificationOpen(!notificationOpen);
                  }}
                  aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`}
                  className="p-2 hover:bg-paper-soft dark:hover:bg-dark rounded-lg transition-colors relative"
                >
                  <Bell size={20} className="text-ink dark:text-white" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold leading-[18px] text-center rounded-full">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {notificationOpen && (
                  <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-dark-hover rounded-xl shadow-lg border border-line/50 dark:border-line/10 z-50">
                    {/* Header */}
                    <div className="p-4 border-b border-line/30 dark:border-line/10">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-ink dark:text-white">
                          Notifications
                        </h3>
                        {unreadCount > 0 && (
                          <span className="px-2 py-1 rounded-full bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 text-xs font-semibold">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                      {notificationsLoading && notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <p className="text-sm text-muted dark:text-white/60">Loading…</p>
                        </div>
                      ) : notificationsError && notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <p className="text-sm text-muted dark:text-white/60 mb-3">
                            Couldn&apos;t load notifications
                          </p>
                          <button
                            onClick={fetchNotifications}
                            className="text-sm text-primary dark:text-brand-300 font-medium hover:underline"
                          >
                            Try again
                          </button>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <p className="text-sm text-muted dark:text-white/60">
                            No notifications yet
                          </p>
                        </div>
                      ) : (
                        notifications.map((notif) => {
                          const { icon: Icon, className: iconClass } =
                            NOTIFICATION_ICONS[notif.type] ?? DEFAULT_NOTIFICATION_ICON;
                          return (
                            <button
                              key={notif.id}
                              onClick={() => openNotification(notif)}
                              className={`w-full text-left p-4 border-b border-line/20 dark:border-line/10 transition-colors ${
                                notif.is_read
                                  ? "bg-white dark:bg-dark-hover hover:bg-paper-soft dark:hover:bg-dark"
                                  : "bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20"
                              }`}
                            >
                              <div className="flex gap-3">
                                <span className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconClass}`}>
                                  <Icon size={18} />
                                </span>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className={`text-sm text-ink dark:text-white ${notif.is_read ? "font-medium" : "font-semibold"}`}>
                                      {notif.title}
                                    </p>
                                    {!notif.is_read && (
                                      <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"></span>
                                    )}
                                  </div>
                                  {notif.message && (
                                    <p className="text-xs text-muted dark:text-white/60 mt-1 break-words">
                                      {notif.message}
                                    </p>
                                  )}
                                  <p
                                    className="text-xs text-muted dark:text-white/50 mt-2"
                                    title={new Date(notif.created_at).toLocaleString()}
                                  >
                                    {timeAgo(notif.created_at)}
                                  </p>
                                </div>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>

                    {/* Footer */}
                    {unreadCount > 0 && (
                      <div className="p-4 border-t border-line/30 dark:border-line/10">
                        <button
                          onClick={markAllNotificationsRead}
                          className="w-full px-4 py-2 text-sm text-primary dark:text-brand-300 font-medium hover:bg-paper-soft dark:hover:bg-dark rounded-lg transition-colors"
                        >
                          Mark all as read
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pl-4 border-l border-line dark:border-line/20">
                <div className="text-right">
                  <p className="text-sm font-medium text-ink dark:text-white">{adminEmail}</p>
                  <p className="text-xs text-muted dark:text-white/40">Super Admin</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                  {adminEmail.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
