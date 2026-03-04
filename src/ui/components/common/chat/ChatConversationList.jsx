import ConversationCard from "./ConversationCard";
import { getPriceRangeLabel } from "@/ui/helpers/apartmentPricing";

const ChatConversationList = ({
  conversations,
  onConversationClick,
  onDeleteConversation,
  activeConversation,
  usersData,
  apartmentsData,
  userId,
}) => {
  const getOtherUserId = (participants = [], isPlatformConversation) => {
    if (isPlatformConversation) return null;
    return participants.find((id) => id !== userId) || null;
  };

  const getParticipantName = (user, isPlatformConversation) => {
    if (isPlatformConversation) return "UniStays";
    if (!user) return "Host";
    if (user?.isAgency) return "Agenzia";
    return (
      user?.displayName ||
      [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
      "Host"
    );
  };

  const getParticipantAvatar = (user, isPlatformConversation) => {
    if (isPlatformConversation) return "/img/logoFullColor.webp";
    return user?.photoUrl;
  };

  const renderConversationCard = (conversation) => {
    const {
      id,
      apartmentId,
      participants = [],
      isPlatformConversation,
    } = conversation;
    const isActive = id === activeConversation?.id;
    const otherUserId = getOtherUserId(participants, isPlatformConversation);
    const otherUserData = otherUserId ? usersData[otherUserId] : null;
    const apartmentData = apartmentId ? apartmentsData[apartmentId] : null;
    const priceLabel = apartmentData
      ? getPriceRangeLabel(apartmentData.aggregates)
      : null;

    return (
      <ConversationCard
        key={id}
        conversation={{
          ...conversation,
          apartmentTitle: isPlatformConversation
            ? "Messaggi da UniStays"
            : apartmentData?.title || "Appartamento",
          apartmentImage: isPlatformConversation
            ? null
            : apartmentData?.apartmentPhotoUrls?.[0],
          apartmentPrice: priceLabel,
        }}
        isActive={isActive}
        participantName={getParticipantName(
          otherUserData,
          isPlatformConversation
        )}
        participantAvatar={getParticipantAvatar(
          otherUserData,
          isPlatformConversation
        )}
        onClick={() => onConversationClick(conversation)}
        onDelete={() => onDeleteConversation(conversation.id)}
        size="small"
        isPlatformConversation={isPlatformConversation}
      />
    );
  };

  return (
    <div className="p-4 space-y-3">
      {conversations
        .filter((conversation) => conversation.isPlatformConversation !== true)
        .map((conversation) =>
          renderConversationCard({
            ...conversation,
            isPlatformConversation:
              conversation.isPlatformConversation === true,
          })
        )}
    </div>
  );
};

export default ChatConversationList;
