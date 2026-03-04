import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";

const ChatInput = ({
  onSendMessage,
  sending = false,
  placeholder = "Scrivi un messaggio...",
  disabled = false,
  maxLength = 1000,
  initialValue = "",
  containerClassName = "",
  textAreaClassName = "",
}) => {
  const [message, setMessage] = useState(initialValue);
  const textareaRef = useRef(null);

  // Aggiorna il messaggio quando cambia initialValue
  useEffect(() => {
    setMessage(initialValue);
  }, [initialValue]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSendMessage = async () => {
    if (!message.trim() || sending || disabled) return;

    const normalize = (str) => str?.trim();

    const messageToSend = normalize(message);
    setMessage("");

    try {
      await onSendMessage({ type: "text", content: messageToSend });
    } catch (error) {
      console.error("Errore invio messaggio:", error);
      setMessage(messageToSend);
    } finally {
      setTimeout(() => textareaRef.current?.focus(), 10);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const canSend = message.trim() && !sending && !disabled;

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center p-3 gap-2 w-full bg-white/85 backdrop-blur-xl border-2 border-[#d4f1ef] rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-[#228E8D] overflow-hidden ${containerClassName}`}
      >
        {/* Text Input */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className={`w-full !bg-transparent text-gray-700 px-6 focus:outline-none focus:ring-0 resize-none ${textAreaClassName}`}
          rows={1}
          style={{ minHeight: "10px", maxHeight: "70px" }}
        />
        {/* Send Button */}
        <button
          onClick={handleSendMessage}
          disabled={!canSend}
          className={`py-2 px-6 rounded-full transition-all duration-200 ${
            canSend
              ? "bg-[#228E8D] text-white shadow-md hover:scale-105 transition-all duration-200"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
          title="Invia messaggio"
        >
          {sending ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <FontAwesomeIcon icon={faPaperPlane} className="text-sm" />
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
