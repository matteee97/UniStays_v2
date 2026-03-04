import { useCallback, useEffect, useState } from "react";
import {
  ensurePlatformConversation,
  PLATFORM_USER_ID,
  subscribePlatformMessages,
  markPlatformMessagesRead,
} from "@/infrastructure/firebase/adapters/platformMessages";

/**
 * Gestisce le notifiche provenienti dalla piattaforma (messaggi UniStays).
 */
export function usePlatformMessages(userId) {
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    let unsubscribe = null;
    let isActive = true;

    setLoading(true);
    setError(null);

    const setupListener = async () => {
      try {
        await ensurePlatformConversation(userId);
      } catch (err) {
        console.error("Errore inizializzazione conversazione piattaforma:", err);
        if (isActive) {
          setError(err.message || "Errore notifiche piattaforma");
          setLoading(false);
        }
        return;
      }

      if (!isActive) return;

      unsubscribe = subscribePlatformMessages(userId, {
        onNext: (mapped) => {
          setMessages(mapped);
          setUnreadCount(
            mapped.filter(
              (msg) => msg.senderId === PLATFORM_USER_ID && msg.isRead !== true
            ).length
          );
          setLoading(false);
        },
        onError: (err) => {
          console.error("Errore nel recupero messaggi piattaforma:", err);
          setError(err.message || "Errore notifiche piattaforma");
          setLoading(false);
        },
      });
    };

    setupListener();

    return () => {
      isActive = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userId]);

  const markAllAsRead = useCallback(async () => {
    if (!userId || messages.length === 0) return;
    const unreadMessages = messages.filter((msg) => msg.isRead !== true);

    try {
      await markPlatformMessagesRead(
        userId,
        unreadMessages.map((msg) => msg.id)
      );
    } catch (err) {
      console.error("Errore nel marcare le notifiche come lette:", err);
    }
  }, [messages, userId]);

  return { messages, unreadCount, loading, error, markAllAsRead };
}
