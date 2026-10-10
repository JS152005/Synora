import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  CheckCheck,
  Trash2,
  UserPlus,
  UserCheck,
  UserX,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../../api/notification.api";
import { getErrorMessage } from "../../utils/error";

import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";
import Tabs from "../../components/ui/Tabs";
import { Skeleton } from "../../components/ui/Skeleton";
import type { NotificationItem, NotificationType } from "../../types/notification";

function NotificationsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notificationsBadge"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      toast.success("All notifications marked as read.");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notificationsBadge"] });
    },
    onError: (err: unknown) =>
      toast.error(getErrorMessage(err, "Failed to mark all as read.")),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onSuccess: () => {
      toast.success("Notification deleted.");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notificationsBadge"] });
    },
    onError: (err: unknown) =>
      toast.error(getErrorMessage(err, "Failed to delete notification.")),
  });

  const handleNotificationClick = (item: NotificationItem) => {
    if (!item.isRead) markReadMutation.mutate(item.id);
    if (
      item.type === "STUDY_REQUEST" ||
      item.type === "REQUEST_ACCEPTED" ||
      item.type === "REQUEST_REJECTED"
    ) {
      navigate("/requests");
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const getNotificationIcon = (type: NotificationType) => {
    const base = "flex h-10 w-10 items-center justify-center rounded-xl shrink-0";
    switch (type) {
      case "STUDY_REQUEST":
        return (
          <div className={`${base} bg-indigo-50 border border-indigo-100 text-indigo-600`}>
            <UserPlus className="h-4.5 w-4.5" aria-hidden="true" />
          </div>
        );
      case "REQUEST_ACCEPTED":
        return (
          <div className={`${base} bg-emerald-50 border border-emerald-100 text-emerald-600`}>
            <UserCheck className="h-4.5 w-4.5" aria-hidden="true" />
          </div>
        );
      case "REQUEST_REJECTED":
        return (
          <div className={`${base} bg-rose-50 border border-rose-100 text-rose-600`}>
            <UserX className="h-4.5 w-4.5" aria-hidden="true" />
          </div>
        );
      default:
        return (
          <div className={`${base} bg-slate-100 border border-slate-200 text-slate-500`}>
            <Bell className="h-4.5 w-4.5" aria-hidden="true" />
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        icon={<Bell className="h-4.5 w-4.5" />}
        title="Notifications & Activity"
        subtitle="Stay updated on study partner invitations, acceptances, and collaborative activity."
        action={
          unreadCount > 0 ? (
            <Button
              variant="outline"
              size="sm"
              isLoading={markAllReadMutation.isPending}
              onClick={() => markAllReadMutation.mutate()}
              leftIcon={<CheckCheck className="h-4 w-4" />}
            >
              Mark all read
            </Button>
          ) : undefined
        }
      />

      {/* Tabs */}
      <Tabs
        tabs={[
          { key: "all" as const, label: "All Activity", count: notifications.length || undefined },
          { key: "unread" as const, label: "Unread", count: unreadCount || undefined },
        ]}
        activeTab={filter}
        onChange={setFilter}
        variant="underline"
      />

      {/* Notification Stream */}
      {isLoading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-2xs"
            >
              <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-6 w-6" />}
          title={filter === "unread" ? "You're all caught up!" : "No notifications yet"}
          description={
            filter === "unread"
              ? "All active notifications have been reviewed."
              : "When study partners request collaboration or accept requests, notifications will appear here."
          }
        />
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleNotificationClick(item);
              }}
              className={`
                group flex items-start justify-between gap-4 rounded-2xl border p-4.5
                transition-all duration-200 cursor-pointer select-none interactive-card
                ${
                  !item.isRead
                    ? "border-indigo-200/90 bg-indigo-50/40 shadow-xs"
                    : "border-slate-200/80 bg-white shadow-2xs"
                }
              `.trim().replace(/\s+/g, " ")}
              aria-label={`${item.title}. ${item.isRead ? "Read" : "Unread"}. ${item.message}`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                {getNotificationIcon(item.type)}

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3
                      className={`text-xs sm:text-sm font-semibold ${
                        !item.isRead ? "text-indigo-950 font-bold" : "text-slate-900"
                      }`}
                    >
                      {item.title}
                    </h3>
                    {!item.isRead && (
                      <span
                        className="h-2 w-2 rounded-full bg-indigo-600 shrink-0"
                        aria-label="Unread indicator"
                      />
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.message}
                  </p>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-0.5 font-medium">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    <time dateTime={item.createdAt}>
                      {new Date(item.createdAt).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div
                className="shrink-0 flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => deleteMutation.mutate(item.id)}
                  disabled={deleteMutation.isPending}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                  title="Delete notification"
                  aria-label="Delete notification"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationsPage;
