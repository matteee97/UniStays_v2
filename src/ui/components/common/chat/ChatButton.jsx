import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useChat } from "@/ui/hooks";

const ChatButton = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [isHovered, setIsHovered] = useState(false);

  const { conversations, unreadCount } = useChat();

  // Non mostrare il pulsante se l'utente non è loggato
  if (!user) {
    return null;
  }

  const handleClick = () => {
    // Se ci sono conversazioni, vai alla prima
    if (conversations.length > 0) {
      const firstConversation = conversations[0];
      const otherId = firstConversation.participants.find(
        (id) => id !== user.id
      );
      navigate(
        `/chat?hostId=${otherId}&apartmentId=${
          firstConversation.apartmentId
        }&apartmentTitle=${encodeURIComponent(
          firstConversation.apartmentTitle || "Chat"
        )}`
      );
    } else {
      // Se non ci sono conversazioni, vai alla pagina chat vuota
      navigate("/chat");
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative bg-[#228E8D] hover:bg-[#1f7e7c] border-2 border-[#d4f1ef] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105"
        title="Chat"
      >
        <FontAwesomeIcon icon={faComments} className="text-xl" />

        {/* Badge per messaggi non letti */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#D4F1EF] border-[#228E8D] border-[1.5px] text-[#228E8D] text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}

        {/* Tooltip */}
        {isHovered && (
          <div className="absolute bottom-full right-0 mb-2 bg-white/85 backdrop-blur-xl border-2 border-[#D4F1EF] text-gray-700 font-medium text-sm px-3 py-2 rounded-lg whitespace-nowrap">
            {conversations.length > 0
              ? `${conversations.length} conversazion${
                  conversations.length > 1 ? "i" : "e"
                }`
              : "Nessuna conversazione"}
            {unreadCount > 0 && (
              <div className="text-[#228E8D]">
                {unreadCount} messaggi{unreadCount > 1 ? "" : "o"} non lett
                {unreadCount > 1 ? "i" : "o"}
              </div>
            )}
          </div>
        )}
      </button>
    </div>
  );
};

export default ChatButton;
