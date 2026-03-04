import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

const DEFAULT_TITLE = "Conversazione rimossa";
const DEFAULT_DESCRIPTION =
  "L'altro partecipante ha rimosso questa conversazione. Non puoi inviare messaggi.";

export default function SystemChatMessage({
  message,
  onDeleteConversation = null,
  onDeleteConversationMessage = "Elimina conversazione",
}) {
  const title = message?.title || DEFAULT_TITLE;
  const description = message?.content || DEFAULT_DESCRIPTION;

  return (
    <div className="flex justify-center items-center h-full text-gray-500 px-6 my-16">
      <div className="text-center max-w-md">
        <div className="bg-[#d4f1ef] border-2 border-[#228E8D] text-gray-700 text-sm px-4 py-3 rounded-lg mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="text-[#228E8D]"
            />
            <span className="font-semibold text-[#228E8D]">{title}</span>
          </div>
          <p className="text-sm mb-3 whitespace-pre-wrap">{description}</p>
          {onDeleteConversation && (
            <button
              onClick={() => onDeleteConversation()}
              className="bg-[#228E8D] hover:brightness-105 text-white text-xs px-3 py-1 rounded-full transition-colors"
            >
              {onDeleteConversationMessage}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
