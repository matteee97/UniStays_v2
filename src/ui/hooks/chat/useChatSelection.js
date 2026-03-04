import { useEffect, useMemo, useState, useRef } from 'react';

export const useChatSelection = ({
  conversations,
  apartmentsData,
  userId,
  hostId,
  apartmentId,
  markMessagesAsRead,
  externalSelectedConversation = null,
  setExternalSelectedConversation = null,
}) => {
  const [internalSelectedConversation, setInternalSelectedConversation] = useState(null);
  const conversationCreatedRef = useRef(false);
  
  // Use external selected conversation if provided, otherwise use internal state
  const selectedConversation = externalSelectedConversation !== null ? externalSelectedConversation : internalSelectedConversation;
  const setSelectedConversation = setExternalSelectedConversation || setInternalSelectedConversation;

  const activeConversation = useMemo(() => {
    const base =
      selectedConversation ||
      conversations.find(
        (conv) =>
          conv.participants.includes(userId) &&
          (hostId ? conv.participants.includes(hostId) : true) &&
          (apartmentId ? conv.apartmentId === apartmentId : true)
      );
    return base
      ? { ...base, apartmentData: apartmentsData[base.apartmentId] }
      : null;
  }, [selectedConversation, conversations, userId, hostId, apartmentId, apartmentsData]);

  const isUserParticipant = !!activeConversation?.participants?.includes(userId);
  // Le conversazioni piattaforma hanno solo l'utente come partecipante ma non sono disabilitate
  const isPlatformConversation = activeConversation?.isPlatformConversation === true;
  const isConversationDisabled =
    !isPlatformConversation && (activeConversation?.participants?.length || 0) <= 1;

  // Auto-select first/specific conversation and mark as read
  useEffect(() => {
    if (conversations.length === 0 || selectedConversation) return;
    
    // Don't auto-select if we're using external selected conversation
    if (externalSelectedConversation !== null) return;

    if (hostId && apartmentId) {
      const specific = conversations.find(
        (conv) =>
          conv.participants.includes(userId) &&
          conv.participants.includes(hostId) &&
          conv.apartmentId === apartmentId
      );
      const toSet = specific || conversations[0];
      if (toSet) {
        setSelectedConversation({
          ...toSet,
          apartmentData: apartmentsData[toSet.apartmentId],
        });
        setTimeout(() => markMessagesAsRead(toSet.id), 1000);
      }
    } else {
      const first = conversations[0];
      if (first) {
        setSelectedConversation({
          ...first,
          apartmentData: apartmentsData[first.apartmentId],
        });
        setTimeout(() => markMessagesAsRead(first.id), 1000);
      }
    }
  }, [conversations, selectedConversation, hostId, apartmentId, userId, apartmentsData, markMessagesAsRead, externalSelectedConversation]);

  // Monitor if selected becomes unavailable; fallback or navigate is handled by caller
  const ensureSelectedStillValid = (onEmpty) => {
    if (!selectedConversation || !conversations.length) return;
    const exists = conversations.find((c) => c.id === selectedConversation.id);
    if (!exists || !exists.participants.includes(userId)) {
      conversationCreatedRef.current = false;
      const remaining = conversations.filter((c) => c.participants.includes(userId));
      if (remaining.length > 0) {
        const next = remaining[0];
        setSelectedConversation({
          ...next,
          apartmentData: apartmentsData[next.apartmentId],
        });
      } else {
        setSelectedConversation(null);
        onEmpty?.();
      }
    }
  };

  return {
    selectedConversation,
    setSelectedConversation,
    activeConversation,
    isUserParticipant,
    isConversationDisabled,
    conversationCreatedRef,
    ensureSelectedStillValid,
  };
};


