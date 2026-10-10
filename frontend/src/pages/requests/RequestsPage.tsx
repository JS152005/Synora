import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserCheck, Send, Users } from "lucide-react";
import toast from "react-hot-toast";

import {
  getIncomingRequests,
  getOutgoingRequests,
  getStudyPartners,
  acceptStudyPartnerRequest,
  rejectStudyPartnerRequest,
  cancelStudyPartnerRequest,
} from "../../api/studyPartner.api";
import { createConversation } from "../../api/conversation.api";
import { useSocket } from "../../context/SocketContext";
import { getErrorMessage } from "../../utils/error";

import PageHeader from "../../components/ui/PageHeader";
import Tabs from "../../components/ui/Tabs";
import RequestCard from "../../components/ui/RequestCard";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonCard } from "../../components/ui/Skeleton";

type TabType = "incoming" | "outgoing" | "partners";

function RequestsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { isUserOnline } = useSocket();

  const tabParam = searchParams.get("tab") as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>(tabParam || "incoming");

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams(tab === "incoming" ? {} : { tab });
  };

  /* ─ Queries ─────────────────────────────────────────────────────────────── */
  const { data: incoming = [], isLoading: loadingIncoming } = useQuery({
    queryKey: ["incomingRequests"],
    queryFn: getIncomingRequests,
  });

  const { data: outgoing = [], isLoading: loadingOutgoing } = useQuery({
    queryKey: ["outgoingRequests"],
    queryFn: getOutgoingRequests,
  });

  const { data: partners = [], isLoading: loadingPartners } = useQuery({
    queryKey: ["studyPartners"],
    queryFn: getStudyPartners,
  });

  /* ─ Mutations ────────────────────────────────────────────────────────────── */
  const acceptMutation = useMutation({
    mutationFn: (requestId: string) => acceptStudyPartnerRequest(requestId),
    onSuccess: () => {
      toast.success("Study partner accepted! Direct chat enabled.");
      queryClient.invalidateQueries({ queryKey: ["incomingRequests"] });
      queryClient.invalidateQueries({ queryKey: ["studyPartners"] });
      queryClient.invalidateQueries({ queryKey: ["incomingRequestsBadge"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (err: unknown) =>
      toast.error(getErrorMessage(err, "Failed to accept request.")),
  });

  const rejectMutation = useMutation({
    mutationFn: (requestId: string) => rejectStudyPartnerRequest(requestId),
    onSuccess: () => {
      toast.success("Request declined.");
      queryClient.invalidateQueries({ queryKey: ["incomingRequests"] });
      queryClient.invalidateQueries({ queryKey: ["incomingRequestsBadge"] });
    },
    onError: (err: unknown) =>
      toast.error(getErrorMessage(err, "Failed to decline request.")),
  });

  const cancelMutation = useMutation({
    mutationFn: (requestId: string) => cancelStudyPartnerRequest(requestId),
    onSuccess: () => {
      toast.success("Request cancelled.");
      queryClient.invalidateQueries({ queryKey: ["outgoingRequests"] });
      queryClient.invalidateQueries({ queryKey: ["outgoingRequestsBadge"] });
    },
    onError: (err: unknown) =>
      toast.error(getErrorMessage(err, "Failed to cancel request.")),
  });

  const openChatMutation = useMutation({
    mutationFn: (partnerId: string) => createConversation(partnerId),
    onSuccess: (res) => navigate(`/chat?conversationId=${res.data.id}`),
    onError: (err: unknown) =>
      toast.error(getErrorMessage(err, "Could not open chat.")),
  });

  const isLoading =
    activeTab === "incoming"
      ? loadingIncoming
      : activeTab === "outgoing"
      ? loadingOutgoing
      : loadingPartners;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        icon={<UserCheck className="h-4.5 w-4.5" />}
        title="Study Partner Requests & Network"
        subtitle="Review incoming study invitations, monitor sent invitations, and collaborate with connected medical peers."
      />

      {/* Tabs */}
      <Tabs
        tabs={[
          {
            key: "incoming" as TabType,
            label: "Incoming Requests",
            icon: <UserCheck className="h-3.5 w-3.5" />,
            count: incoming.length || undefined,
          },
          {
            key: "outgoing" as TabType,
            label: "Sent Requests",
            icon: <Send className="h-3.5 w-3.5" />,
            count: outgoing.length || undefined,
          },
          {
            key: "partners" as TabType,
            label: "Connected Partners",
            icon: <Users className="h-3.5 w-3.5" />,
            count: partners.length || undefined,
          },
        ]}
        activeTab={activeTab}
        onChange={handleTabChange}
        variant="underline"
      />

      {/* Grid Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : activeTab === "incoming" ? (
        incoming.length === 0 ? (
          <EmptyState
            icon={<UserCheck className="h-6 w-6" />}
            title="No pending incoming invitations"
            description="When medical students invite you to collaborate, their requests will appear here with one-click acceptance."
            actionLabel="Discover Students"
            onAction={() => navigate("/students")}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
            {incoming.map((req) => (
              <RequestCard
                key={req.id}
                type="incoming"
                request={req}
                isOnline={isUserOnline(req.sender?.id || "")}
                onAccept={() => acceptMutation.mutate(req.id)}
                onReject={() => rejectMutation.mutate(req.id)}
                isLoadingAction={acceptMutation.isPending || rejectMutation.isPending}
              />
            ))}
          </div>
        )
      ) : activeTab === "outgoing" ? (
        outgoing.length === 0 ? (
          <EmptyState
            icon={<Send className="h-6 w-6" />}
            title="No sent requests pending"
            description="You don't have any outgoing partner requests waiting for responses. Explore the student directory to send invitations!"
            actionLabel="Find Study Partners"
            onAction={() => navigate("/students")}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
            {outgoing.map((req) => (
              <RequestCard
                key={req.id}
                type="outgoing"
                request={req}
                isOnline={isUserOnline(req.receiver?.id || "")}
                onCancel={() => cancelMutation.mutate(req.id)}
                isLoadingAction={cancelMutation.isPending}
              />
            ))}
          </div>
        )
      ) : partners.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="No study partners connected yet"
          description="Once you accept partner requests or peers accept your invitations, they will appear here with direct real-time chat."
          actionLabel="Find Study Partners"
          onAction={() => navigate("/students")}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
          {partners.map((partner) => (
            <RequestCard
              key={partner.id}
              type="partner"
              partner={partner}
              isOnline={isUserOnline(partner.id)}
              onChat={() => openChatMutation.mutate(partner.id)}
              isLoadingAction={openChatMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default RequestsPage;
