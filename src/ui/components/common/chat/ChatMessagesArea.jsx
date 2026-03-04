import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments } from "@fortawesome/free-solid-svg-icons";
import ChatMessage from "./messages/ChatMessage";
import LoadingIcon from "../shared/icons/LoadingIcon";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ChatAccessDenied from "./ChatAccessDenied";
import { USER_ROLES } from "@/shared/types";

const ChatMessagesArea = ({
  conversationMessages,
  activeConversation = null,
  avatar,
  chatLoading,
  isMyMessage,
  onDeleteConversation = null,
  isUserParticipant = true,
  hasConversations = true,
  onCreateConversation = null,
}) => {
  const navigate = useNavigate();
  // Scroll to bottom when new messages are added or when the component is mounted
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (conversationMessages.length === 0) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationMessages]);

  if (chatLoading) {
    return <LoadingIcon />;
  }

  // Se l'utente non è un partecipante, mostra messaggio di errore
  if (!isUserParticipant) {
    return <ChatAccessDenied onBack={() => navigate(-1)} />;
  }

  if (conversationMessages.length === 0) {
    // Se non ci sono conversazioni disponibili, mostra un messaggio diverso
    if (!hasConversations) {
      return (
        <div className="bg-white flex justify-center items-center h-full text-gray-500 px-6">
          <div className="text-center max-w-md">
            <FontAwesomeIcon
              icon={faComments}
              className="text-6xl mb-4 opacity-50"
            />
            <h3 className="text-lg font-semibold mb-2">
              Benvenuto nella chat!
            </h3>
            <p className="text-sm mb-4">
              Non hai ancora nessuna conversazione. Inizia a esplorare gli
              appartamenti per iniziare a chattare con gli {USER_ROLES.HOST}!
            </p>
            {onCreateConversation && (
              <button
                onClick={onCreateConversation}
                className="bg-[#228E8D] hover:bg-[#1a6b6a] text-white text-sm px-4 py-2 rounded-full transition-colors"
              >
                Inizia conversazione
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white flex justify-center items-center h-full text-gray-500 px-6">
        <div className="text-center">
          <FontAwesomeIcon
            icon={faComments}
            className="text-6xl mb-4 opacity-50"
          />
          <h3 className="text-lg font-semibold mb-2">
            Nessun messaggio ancora
          </h3>
          <p className="text-sm mb-4">Inizia la conversazione!</p>
        </div>
      </div>
    );
  }

  // Helper function to check if we should show date
  const shouldShowDate = (currentMessage, previousMessage) => {
    if (!previousMessage) return false; // don't show date for first message

    const currentDate = new Date(
      currentMessage.timestamp?.toDate?.() || currentMessage.timestamp,
    );
    const previousDate = new Date(
      previousMessage.timestamp?.toDate?.() || previousMessage.timestamp,
    );

    // Show date if difference is more than 120 minutes (2 hours)
    const timeDiff = Math.abs(currentDate - previousDate);
    const thirtyMinutes = 120 * 60 * 1000; // 120 minutes in milliseconds

    return timeDiff > thirtyMinutes;
  };

  // Group consecutive messages from the same sender
  const groupedMessages = conversationMessages.reduce(
    (groups, message, index) => {
      const prevMessage = conversationMessages[index - 1];
      const isFirstMessage = index === 0;
      const isDifferentSender =
        isFirstMessage || prevMessage.senderId !== message.senderId;

      if (isDifferentSender) {
        groups.push([message]);
      } else {
        groups[groups.length - 1].push(message);
      }

      return groups;
    },
    [],
  );

  return (
    <div
      className="pb-44 p-4 bg-gradient-to-br from-[#fff] to-[#e2f6f4] dark:from-[#14202e] dark:to-[#0F172A] flex-1 overflow-y-auto min-h-0 max-h-full touch-pan-y"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {groupedMessages.map((messageGroup, groupIndex) => {
        const isLastGroup = groupIndex === groupedMessages.length - 1;

        return (
          <div key={groupIndex} className={isLastGroup ? "mt-2" : "mb-0"}>
            {messageGroup.map((message, messageIndex) => {
              const isLastMessageInGroup =
                messageIndex === messageGroup.length - 1;
              const showInfo = isLastMessageInGroup;

              // Check if we should show date for this message
              const prevMessage =
                messageIndex === 0
                  ? groupIndex > 0
                    ? groupedMessages[groupIndex - 1][
                        groupedMessages[groupIndex - 1].length - 1
                      ]
                    : null
                  : messageGroup[messageIndex - 1];
              const showDate =
                isLastMessageInGroup || shouldShowDate(message, prevMessage);

              return (
                <ChatMessage
                  key={message.id}
                  message={message}
                  conversationId={activeConversation?.id || null}
                  apartmentId={activeConversation?.apartmentId || null}
                  isMyMessage={isMyMessage(message)}
                  showReadStatus={showInfo || showDate}
                  showAvatar={showInfo}
                  avatar={avatar}
                  showDate={isLastMessageInGroup || showDate}
                  isGrouped={messageGroup.length > 1}
                  isFirstInGroup={messageIndex === 0}
                  isLastInGroup={isLastMessageInGroup}
                  onDeleteConversation={onDeleteConversation}
                />
              );
            })}
          </div>
        );
      })}
      {/* Elemento invisibile per lo scroll automatico */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessagesArea;
