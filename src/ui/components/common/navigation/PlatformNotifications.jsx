import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-regular-svg-icons";
import { useUser } from "@clerk/clerk-react";
import { usePlatformMessages } from "@/ui/hooks/chat/usePlatformMessages";
import { useClickOutside } from "@/ui/hooks";
import FloatingMenuPanel from "./FloatingMenuPanel";
import { PlatformChatMessage } from "../chat";
import { formatDate } from "@/ui/helpers/formatDate";
import ActionLabel from "../indicators/ActionLabel";

export default function PlatformNotifications({ className = "" }) {
  const { user } = useUser();
  const userId = user?.id;
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { messages, unreadCount, loading, markAllAsRead } =
    usePlatformMessages(userId);

  useClickOutside(dropdownRef, () => setOpen(false), null, open);

  useEffect(() => {
    if (open) {
      markAllAsRead();
    }
  }, [open, markAllAsRead]);

  if (!userId) return null;

  return (
    <div className={className}>
      <button
        type="button"
        aria-label="Notifiche piattaforma"
        onClick={() => setOpen((prev) => !prev)}
        className="group relative flex items-center gap-2"
      >
        <span className="relative">
          <FontAwesomeIcon
            icon={faBell}
            className="mt-1 w-5 h-5 text-[#228E8D] group-hover:scale-105 transition-transform duration-300"
          ></FontAwesomeIcon>
          {unreadCount > 0 && (
            <span className="absolute -top-[2px] -right-[4px] h-[14px] min-w-[14px] px-1 font-semibold text-[8px] text-[#228E8D] bg-[#D4F1EF] border border-[#228E8D] rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </span>
        <ActionLabel text="Notifiche" count={unreadCount} />
      </button>

      {open && (
        <FloatingMenuPanel
          ref={dropdownRef}
          positionClass="absolute left-0 sm:left-auto sm:translate-x-0 sm:transform sm:translate-x-[-50%] sm:right-0 -top-[480px] sm:top-4 w-[screen] sm:w-[350px] shadow-2xl rounded-2xl"
          className="overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b bg-white border-gray-100 dark:border-[#1F2937]">
            <p className="text-sm font-semibold text-gray-800">
              Messaggi da{" "}
              <span className="text-[#228E8D] font-bold">UniStays</span>
            </p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] text-[#228E8D] hover:underline"
              >
                Segna come letti
              </button>
            )}
          </div>
          <div className="max-h-[400px] sm:max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-sm text-gray-500">Caricamento...</div>
            ) : messages.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">
                Nessun messaggio dalla piattaforma
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`px-4 py-3  ${
                    msg.isRead ? "bg-white" : "bg-[#228E8D]/5"
                  }`}
                >
                  <p className="text-xs text-gray-400">
                    {msg.timestamp
                      ? formatDate(msg.timestamp, "it-IT", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </p>
                  <div className="mt-2">
                    <PlatformChatMessage
                      message={msg}
                      variant="compact"
                      showPreview
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </FloatingMenuPanel>
      )}
    </div>
  );
}
