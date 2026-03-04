import PlatformChatMessage from "./platformChatMessage/PlatformChatMessage";
import SystemChatMessage from "./SystemChatMessage";
import UserChatMessage from "./userChatMessage/UserChatMessage";
import { PLATFORM_USER_ID } from "@/infrastructure/firebase/adapters/platformMessages";

const ChatMessage = ({
  message,
  conversationId = null,
  apartmentId = null,
  isMyMessage,
  avatar,
  showAvatar = true,
  showReadStatus = true,
  showDate = true,
  isFirstInGroup = false,
  isLastInGroup = true,
  onEdit = null,
  onDelete = null,
  onReply = null,
  onDeleteConversation = null,
}) => {
  if (message.isDeleted) {
    return (
      <div
        className={`flex ${isMyMessage ? "justify-end" : "justify-start"} mb-2`}
      >
        <div className="bg-[#d4f1ef] text-gray-500 text-sm px-3 py-2 rounded-lg italic">
          Messaggio eliminato
        </div>
      </div>
    );
  }

  if (message.isPlatformMessage || message.senderId === PLATFORM_USER_ID) {
    return <PlatformChatMessage message={message} />;
  }

  if (message.isSystemMessage) {
    return (
      <SystemChatMessage
        message={message}
        onDeleteConversation={onDeleteConversation}
      />
    );
  }

  return (
    <UserChatMessage
      message={message}
      conversationId={conversationId}
      apartmentId={apartmentId}
      isMyMessage={isMyMessage}
      avatar={avatar}
      showAvatar={showAvatar}
      showReadStatus={showReadStatus}
      showDate={showDate}
      isFirstInGroup={isFirstInGroup}
      isLastInGroup={isLastInGroup}
      onEdit={onEdit}
      onDelete={onDelete}
      onReply={onReply}
    />
  );
};

export default ChatMessage;
