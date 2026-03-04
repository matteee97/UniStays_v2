import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import {
  getUserConversations,
  getConversationMessages,
  addMessage,
  markMessagesAsRead,
  findOrCreateConversation,
  removeUserFromConversation
} from "@/infrastructure/firebase/adapters/chat";
import fetchUserData from '../fetches/fetchUserData';
import { FirestoreApartmentRepository } from "@/infrastructure/firebase/repositories/FirestoreApartmentRepository";
import { normalizeChatPayload } from '@/ui/helpers/chatPayload';

/**
 * Hook per gestire la chat in tempo reale
 * @param {string} currentConversationId - ID della conversazione corrente
 * @returns {Object} - Stato e funzioni della chat
 */
export const useChat = (currentConversationId = null) => {
  const { user } = useUser();
  const userId = user?.id;

  // Stati principali
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [usersData, setUsersData] = useState({});
  const [apartmentsData, setApartmentsData] = useState({});
  
  // Stati UI
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Refs per cleanup
  const conversationsUnsubscribe = useRef(null);
  const messagesUnsubscribe = useRef(null);

  // Funzione per caricare i dettagli degli appartamenti
  const loadApartmentData = useCallback(async (apartmentId) => {
    if (!apartmentId || apartmentsData[apartmentId]) return;

    try {
      const apartmentData = await FirestoreApartmentRepository.getById(
        apartmentId
      );
      if (apartmentData) {
        setApartmentsData((prev) => ({
          ...prev,
          [apartmentId]: {
            id: apartmentId,
            title: apartmentData.title,
            apartmentPhotoUrls: apartmentData.apartmentPhotoUrls,
            aggregates: apartmentData.aggregates || null,
            address: apartmentData.address,
            status: apartmentData.status ?? null,
            ownerId: apartmentData.ownerId ?? null,
          },
        }));
      }
    } catch (err) {
      console.error("Errore caricamento appartamento:", err);
    }
  }, [apartmentsData]);

  // Calcola il numero totale di messaggi non letti
  useEffect(() => {
    if (!userId || !conversations.length) {
      setUnreadCount(0);
      return;
    }

    const totalUnread = conversations.reduce((total, conv) => {
      const userUnread = conv.unreadCount?.[userId] || 0;
      return total + userUnread;
    }, 0);

    setUnreadCount(totalUnread);
  }, [conversations, userId]);

  // Setup listener per le conversazioni
  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    conversationsUnsubscribe.current = getUserConversations(
      userId,
      async (conversationsData) => {
        const userConversations = conversationsData.filter(
          (conv) => conv.isPlatformConversation !== true
        );

        setConversations(userConversations);
        setLoading(false);
        
        // Fetch dati degli host (escludi conversazioni piattaforma)
        const hostIds = conversationsData
          .filter(conv => !conv.isPlatformConversation)
          .map(conv => {
            const otherId = conv.participants.find(id => id !== userId);
            return otherId;
          })
          .filter(Boolean);
        
        if (hostIds.length > 0) {
          const uniqueHostIds = Array.from(new Set(hostIds));
          const users = {};

          const results = await Promise.allSettled(
            uniqueHostIds.map((hostId) =>
              fetchUserData(hostId, { allowMissing: true })
            )
          );

          results.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value) {
              users[uniqueHostIds[index]] = result.value;
            }
          });

          if (Object.keys(users).length > 0) {
            setUsersData((prev) => ({ ...prev, ...users }));
          }
        }

        // Fetch dati degli appartamenti
        const apartmentIds = conversationsData
          .map(conv => conv.apartmentId)
          .filter(Boolean);
        
        for (const apartmentId of apartmentIds) {
          await loadApartmentData(apartmentId);
        }
      }
    );

    return () => {
      if (conversationsUnsubscribe.current) {
        conversationsUnsubscribe.current();
      }
    };
  }, [userId]);

  // Setup listener per i messaggi della conversazione attiva
  useEffect(() => {
    if (!currentConversationId) {
      setMessages([]);
      return;
    }

    messagesUnsubscribe.current = getConversationMessages(
      currentConversationId,
      (messagesData) => {
        setMessages(messagesData);
        
        // Segna i messaggi come letti quando si apre la conversazione
        if (userId && messagesData.length > 0) {
          markMessagesAsRead(currentConversationId, userId);
        }
      }
    );

    return () => {
      if (messagesUnsubscribe.current) {
        messagesUnsubscribe.current();
      }
    };
  }, [currentConversationId, userId]);

  // Funzione per inviare un messaggio
  const sendMessage = useCallback(
    async (payload) => {
      const normalized = normalizeChatPayload(payload);
      if (!normalized || !currentConversationId || !userId) {
        return null;
      }

      const { content, type, meta } = normalized;
      if (!content.trim()) return null;

      setSending(true);
      setError(null);

      try {
        return await addMessage(
          currentConversationId,
          userId,
          content.trim(),
          type,
          meta || {}
        );
      } catch (err) {
        setError("Errore invio messaggio: " + err.message);
        return null;
      } finally {
        setSending(false);
      }
    },
    [currentConversationId, userId]
  );

  // Funzione per iniziare una nuova conversazione
  const startConversation = useCallback(async (hostId, apartmentId, initialMessage = null) => {
    if (!userId || !hostId || !apartmentId) {
      const errorMsg = 'Dati mancanti per iniziare la conversazione (userId, hostId, apartmentId sono obbligatori)';
      setError(errorMsg);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const conversationId = await findOrCreateConversation(userId, hostId, apartmentId);

      setIsOpen(true);
      return conversationId;
    } catch (err) {
      const errorMsg = 'Errore creazione conversazione: ' + err.message;
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Funzione per aprire una conversazione esistente
  const openConversation = useCallback((conversationId) => {
    setIsOpen(true);
    // Il listener dei messaggi si attiverà automaticamente quando currentConversationId cambia
  }, []);

  // Funzione per chiudere la chat
  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Funzione per ottenere i dati dell'altro partecipante
  const getOtherParticipant = useCallback((conversation) => {
    if (!conversation || !userId) return null;
    
    // Se è una conversazione piattaforma, non c'è altro partecipante
    if (conversation.isPlatformConversation) {
      return null;
    }
    
    const otherId = conversation.participants.find(id => id !== userId);
    return {
      id: otherId,
      isHost: otherId === conversation.hostId,
      isUser: otherId === conversation.userId
    };
  }, [userId]);

  // Funzione per ottenere il nome dell'altro partecipante
  const getParticipantName = useCallback((conversation) => {
    if (conversation.isPlatformConversation) {
      return "UniStays";
    }
    
    const other = getOtherParticipant(conversation);
    if (!other) return 'Utente';
    
    const userData = usersData[other.id];
    if (userData) {
      return (
        userData.displayName ||
        [userData.firstName, userData.lastName].filter(Boolean).join(" ") ||
        userData.firstName ||
        "Utente"
      );
    }
    
    return 'Utente';
  }, [getOtherParticipant, usersData]);

  // Funzione per ottenere l'avatar dell'altro partecipante
  const getParticipantAvatar = useCallback((conversation) => {
    if (conversation.isPlatformConversation) {
      return "/img/logoFullColor.webp";
    }
    
    const other = getOtherParticipant(conversation);
    if (!other) return null;
    
    const userData = usersData[other.id];
    if (userData) {
      return userData.photoUrl || userData.profileImageUrl || userData.imageUrl;
    }
    
    return null;
  }, [getOtherParticipant, usersData]);

  // Funzione per formattare l'ultimo messaggio
  const formatLastMessage = useCallback((conversation) => {
    if (!conversation.lastMessage) return 'Nessun messaggio';
    
    const isFromCurrentUser = conversation.lastMessageSender === userId;
    const prefix = isFromCurrentUser ? 'Tu: ' : '';
    
    return prefix + conversation.lastMessage;
  }, [userId]);

  // Funzione per ottenere il tempo dell'ultimo messaggio
  const getLastMessageTime = useCallback((conversation) => {
    if (!conversation.lastMessageTime) return null;
    
    const timestamp = conversation.lastMessageTime.toDate ? 
      conversation.lastMessageTime.toDate() : 
      new Date(conversation.lastMessageTime);
    
    return timestamp;
  }, []);

  // Funzione per controllare se un messaggio è del current user
  const isMyMessage = useCallback((message) => {
    return message.senderId === userId;
  }, [userId]);

  // Funzione per ottenere il numero di messaggi non letti per una conversazione
  const getUnreadCount = useCallback((conversation) => {
    if (!userId || !conversation.unreadCount) return 0;
    return conversation.unreadCount[userId] || 0;
  }, [userId]);

  // Funzione per marcare i messaggi come letti manualmente
  const markMessagesAsReadManually = useCallback(async (conversationId) => {
    if (!conversationId || !userId) {
      return;
    }

    try {
      await markMessagesAsRead(conversationId, userId);
    } catch (error) {
    }
  }, [userId]);

  // Funzione per eliminare una conversazione (soft delete)
  const deleteConversationById = useCallback(async (conversationId) => {
    if (!conversationId || !userId) {
      return;
    }

    try {
      await removeUserFromConversation(conversationId, userId);
    } catch (error) {
      setError('Errore nell\'eliminazione della conversazione');
    }
  }, [userId]);

  // Cleanup al dismount
  useEffect(() => {
    return () => {
      if (conversationsUnsubscribe.current) {
        conversationsUnsubscribe.current();
      }
      if (messagesUnsubscribe.current) {
        messagesUnsubscribe.current();
      }
    };
  }, []);

  return {
    // Stati
    conversations,
    messages,
    loading,
    error,
    sending,
    isOpen,
    unreadCount,
    usersData,
    
    // Funzioni
    sendMessage,
    startConversation,
    openConversation,
    closeChat,
    setIsOpen,
    deleteConversation: deleteConversationById,
    
    // Utility
    getOtherParticipant,
    getParticipantName,
    getParticipantAvatar,
    formatLastMessage,
    getLastMessageTime,
    isMyMessage,
    getUnreadCount,
    markMessagesAsReadManually,
    apartmentsData,
    
    // Clear error
    clearError: () => setError(null)
  }
}
