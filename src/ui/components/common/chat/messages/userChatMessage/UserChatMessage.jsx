import { useEffect, useMemo, useRef, useState } from "react";
import {
  faEdit,
  faTrash,
  faReply,
  faFlag,
} from "@fortawesome/free-solid-svg-icons";
import UserMessageAvatar from "./parts/UserMessageAvatar";
import UserMessageBubble from "./parts/UserMessageBubble";
import UserMessageMeta from "./parts/UserMessageMeta";
import UserMessageActions from "./parts/UserMessageActions";
import { useClickOutside } from "@/ui/hooks";
import ReportModal from "@/ui/components/common/reports/ReportModal";

// Detect emoji-only messages so we can render them with a larger visual style.
const emojiCharset = "\\p{Extended_Pictographic}";
const singleEmoji = `(?:${emojiCharset})(?:\\uFE0F)?`;
const emojiSequenceRegex = new RegExp(
  `^${singleEmoji}(?:\\u200D${singleEmoji})*$`,
  "u",
);

const isEmojiOnlyText = (value) => {
  if (typeof value !== "string") return false;

  const trimmed = value.trim();
  if (!trimmed) return false;

  return trimmed
    .split(/\s+/)
    .every((segment) => segment && emojiSequenceRegex.test(segment));
};

const getBookingDetails = (message) => {
  if (!message || message.type !== "booking-preview") return null;

  const metadata = message.metadata || {};
  const parsedRooms = Number.parseInt(metadata.roomsRequested, 10);
  const roomLabel =
    typeof metadata.roomLabel === "string" ? metadata.roomLabel : null;

  return {
    title: metadata.title || "Richiesta prenotazione",
    date: metadata.date || null,
    roomsRequested: Number.isFinite(parsedRooms) ? parsedRooms : null,
    roomLabel,
    reason: metadata.reason || null,
    previewImage: metadata.previewImage || null,
  };
};

const UserChatMessage = ({
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
}) => {
  const actionsRef = useRef();
  useClickOutside(actionsRef, () => setIsActionsOpen(false));
  const [isHovered, setIsHovered] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(
    typeof message.content === "string" ? message.content : "",
  );

  useEffect(() => {
    if (!isEditing) {
      setEditContent(
        typeof message.content === "string" ? message.content : "",
      );
    }
  }, [message.content, isEditing]);

  const isEmojiOnlyMessage = isEmojiOnlyText(message.content);
  const bookingDetails = getBookingDetails(message);
  const isBookingPreview = Boolean(bookingDetails);
  const previewImage = isBookingPreview ? bookingDetails.previewImage : null;
  const reportTarget = useMemo(() => {
    if (isMyMessage) return null;

    const messageId =
      typeof message?.id === "string" ? message.id.trim() : null;
    const senderId =
      typeof message?.senderId === "string" ? message.senderId.trim() : null;
    const normalizedConversationId =
      typeof conversationId === "string" ? conversationId.trim() : null;

    if (messageId && normalizedConversationId) {
      return {
        type: "message",
        id: messageId,
        messageId,
        conversationId: normalizedConversationId,
        apartmentId: apartmentId || null,
        userId: senderId || null,
      };
    }

    if (senderId) {
      return {
        type: "user",
        id: senderId,
        userId: senderId,
      };
    }

    return null;
  }, [
    apartmentId,
    conversationId,
    isMyMessage,
    message?.id,
    message?.senderId,
  ]);
  const canReport = Boolean(reportTarget);

  const handleEdit = () => {
    if (onEdit && editContent.trim() && editContent !== message.content) {
      onEdit(message.id, editContent.trim());
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(typeof message.content === "string" ? message.content : "");
  };

  const handleDelete = () => {
    setIsActionsOpen(false);
    if (
      onDelete &&
      window.confirm("Sei sicuro di voler eliminare questo messaggio?")
    ) {
      onDelete(message.id);
    }
  };

  const handleStartEdit = () => {
    if (!onEdit || !isMyMessage) return;
    setIsEditing(true);
    setIsActionsOpen(false);
  };

  const handleReply = () => {
    if (!onReply) return;
    onReply(message);
    setIsActionsOpen(false);
  };

  const handleReport = () => {
    if (!canReport) return;
    setIsActionsOpen(false);
    setIsReportModalOpen(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const actions = [
    onReply
      ? {
          key: "reply",
          icon: faReply,
          label: "Rispondi",
          className: "hover:text-[#228E8D]",
          onClick: handleReply,
        }
      : null,
    isMyMessage && onEdit
      ? {
          key: "edit",
          icon: faEdit,
          label: "Modifica",
          className: "hover:text-[#228E8D]",
          onClick: handleStartEdit,
        }
      : null,
    isMyMessage && onDelete
      ? {
          key: "delete",
          icon: faTrash,
          label: "Elimina",
          className: "hover:text-red-500",
          onClick: handleDelete,
        }
      : null,
    canReport
      ? {
          key: "report",
          icon: faFlag,
          label: "Segnala",
          className: "hover:text-red-500",
          onClick: handleReport,
        }
      : null,
  ].filter(Boolean);

  const hasActions = actions.length > 0;
  const actionsVisible =
    hasActions && !isEditing && (isHovered || isActionsOpen);

  return (
    <div
      className={`flex ${isMyMessage ? "justify-end" : "justify-start"} ${
        isLastInGroup ? "mb-3" : "mb-0.5"
      } group`}
    >
      <div
        className={`flex ${
          isBookingPreview ? "max-w-[80%] lg:max-w-[550px]" : "max-w-[75%]"
        } ${isMyMessage ? "flex-row-reverse" : "flex-row"} items-end gap-2`}
      >
        {!isMyMessage && (
          <div className="flex-shrink-0">
            <UserMessageAvatar
              avatar={avatar}
              showAvatar={showAvatar}
              senderName={message.senderName || "Utente"}
            />
          </div>
        )}

        <div
          className={`relative ${
            isMyMessage ? "items-end" : "items-start"
          } flex flex-col`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <UserMessageBubble
            message={message}
            isEmojiOnlyMessage={isEmojiOnlyMessage}
            isBookingPreview={isBookingPreview}
            bookingDetails={bookingDetails}
            previewImage={previewImage}
            isMyMessage={isMyMessage}
            isFirstInGroup={isFirstInGroup}
            isLastInGroup={isLastInGroup}
            isEditing={isEditing}
            editContent={editContent}
            onEditChange={(e) => setEditContent(e.target.value)}
            onEditSave={handleEdit}
            onEditCancel={handleCancelEdit}
            onEditKeyDown={handleKeyDown}
          />

          <UserMessageMeta
            message={message}
            isMyMessage={isMyMessage}
            showReadStatus={showReadStatus}
            showDate={showDate}
          />

          <div ref={actionsRef}>
            <UserMessageActions
              actions={actions}
              isVisible={actionsVisible && isActionsOpen}
              align={isMyMessage ? "left" : "right"}
              onToggle={() => {
                if (!hasActions || isEditing) return;
                setIsActionsOpen((prev) => !prev);
              }}
              showToggle={
                !isEditing && hasActions && (isHovered || isActionsOpen)
              }
            />
          </div>
        </div>
      </div>
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        target={reportTarget}
        targetLabel={reportTarget?.type === "user" ? "utente" : "messaggio"}
        title={
          reportTarget?.type === "user" ? "Segnala utente" : "Segnala messaggio"
        }
      />
    </div>
  );
};

export default UserChatMessage;
