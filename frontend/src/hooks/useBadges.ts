import { useQuery } from "@tanstack/react-query";
import { getIncomingRequests } from "../api/studyPartner.api";
import { getNotifications } from "../api/notification.api";
import { useAuth } from "../features/auth/useAuth";

export function useBadges() {
  const { isAuthenticated } = useAuth();

  const requestsQuery = useQuery({
    queryKey: ["incomingRequestsBadge"],
    queryFn: getIncomingRequests,
    enabled: isAuthenticated,
    refetchInterval: 15000,
  });

  const notificationsQuery = useQuery({
    queryKey: ["notificationsBadge"],
    queryFn: getNotifications,
    enabled: isAuthenticated,
    refetchInterval: 15000,
  });

  const incomingCount = requestsQuery.data?.length ?? 0;
  const unreadNotificationsCount =
    notificationsQuery.data?.filter((n) => !n.isRead).length ?? 0;

  return {
    incomingRequestsCount: incomingCount,
    unreadNotificationsCount,
    requests: requestsQuery.data ?? [],
    notifications: notificationsQuery.data ?? [],
  };
}
