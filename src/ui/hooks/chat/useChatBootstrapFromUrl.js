import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createBookingKey,
  normalizeChatPayload,
} from "@/ui/helpers/chatPayload";
import { hasMessageWithBookingKey } from "@/infrastructure/firebase/adapters/chat";
import { toast } from "sonner";

const STATUS = {
  idle: "idle",
  creating: "creating",
  ready: "ready",
  error: "error",
};

export const useChatBootstrapFromUrl = ({
  hostId,
  apartmentId,
  userId,
  payload,
  conversations,
  apartmentsData,
  selectedConversation,
  setSelectedConversation,
  startConversation,
  sendMessage,
}) => {
  const [status, setStatus] = useState(STATUS.idle);
  const [error, setError] = useState(null);

  const creationInFlightRef = useRef(false);
  const pendingConversationIdRef = useRef(null);
  const bookingSendRef = useRef(new Set());
  const lastBootstrapKeyRef = useRef(null);
  const forceSelectRef = useRef(false);
  const bootstrapKey =
    hostId && apartmentId ? `${hostId}:${apartmentId}` : null;

  const normalizedPayload = useMemo(
    () => normalizeChatPayload(payload),
    [payload]
  );

  useEffect(() => {
    if (!bootstrapKey) return;
    if (lastBootstrapKeyRef.current !== bootstrapKey) {
      lastBootstrapKeyRef.current = bootstrapKey;
      forceSelectRef.current = true;
    }
  }, [bootstrapKey]);

  useEffect(() => {
    if (!hostId || !apartmentId || !userId) {
      setStatus(STATUS.idle);
      setError(null);
    }
  }, [hostId, apartmentId, userId]);

  const shouldAutoSelect = useCallback(
    () => forceSelectRef.current || !selectedConversation,
    [selectedConversation]
  );

  const getConversationForParams = useCallback(() => {
    if (!hostId || !apartmentId || !userId) return null;
    return conversations.find(
      (conv) =>
        conv.participants.includes(userId) &&
        conv.participants.includes(hostId) &&
        conv.apartmentId === apartmentId
    );
  }, [conversations, userId, hostId, apartmentId]);

  const withApartmentData = useCallback(
    (conversation) =>
      conversation
        ? {
            ...conversation,
            apartmentData: apartmentsData[conversation.apartmentId],
          }
        : null,
    [apartmentsData]
  );

  useEffect(() => {
    const pendingId = pendingConversationIdRef.current;
    if (!pendingId) return;

    if (!shouldAutoSelect()) {
      pendingConversationIdRef.current = null;
      return;
    }

    const pendingConversation = conversations.find((conv) => conv.id === pendingId);

    if (pendingConversation) {
      pendingConversationIdRef.current = null;
      forceSelectRef.current = false;
      setSelectedConversation(withApartmentData(pendingConversation));
    }
  }, [conversations, shouldAutoSelect, withApartmentData, setSelectedConversation]);

  useEffect(() => {
    if (!hostId || !apartmentId || !userId) return;

    const existingConversation = getConversationForParams();
    if (existingConversation) {
      if (shouldAutoSelect()) {
        forceSelectRef.current = false;
        setSelectedConversation(withApartmentData(existingConversation));
      }
      setStatus(STATUS.ready);
      return;
    }

    if (creationInFlightRef.current || pendingConversationIdRef.current) {
      return;
    }

    creationInFlightRef.current = true;
    setStatus(STATUS.creating);

    const createConversation = async () => {
      try {
        const conversationId = await startConversation(hostId, apartmentId);
        if (conversationId) {
          if (shouldAutoSelect()) {
            forceSelectRef.current = false;
            pendingConversationIdRef.current = conversationId;
            setSelectedConversation({
              id: conversationId,
              participants: [userId, hostId],
              apartmentId,
              apartmentData: apartmentsData[apartmentId],
            });
          } else {
            pendingConversationIdRef.current = null;
          }
          setStatus(STATUS.ready);
        } else {
          setStatus(STATUS.error);
        }
      } catch (err) {
        setError(err);
        setStatus(STATUS.error);
      } finally {
        creationInFlightRef.current = false;
      }
    };

    createConversation();
  }, [
    hostId,
    apartmentId,
    userId,
    startConversation,
    apartmentsData,
    getConversationForParams,
    selectedConversation,
    setSelectedConversation,
    shouldAutoSelect,
    withApartmentData,
  ]);

  useEffect(() => {
    if (!normalizedPayload || normalizedPayload.type !== "booking-preview") {
      return;
    }
    if (!selectedConversation?.id || !userId) return;
    if (selectedConversation.apartmentId !== apartmentId) return;
    if (hostId && !selectedConversation.participants?.includes(hostId)) return;

    const bookingKey =
      normalizedPayload.meta?.bookingKey ||
      createBookingKey({
        userId,
        hostId,
        apartmentId,
        meta: normalizedPayload.meta,
      });
    const messageKey = `${selectedConversation.id}:${bookingKey}`;

    if (bookingSendRef.current.has(messageKey)) return;

    const payloadToSend = {
      ...normalizedPayload,
      meta: {
        ...(normalizedPayload.meta || {}),
        bookingKey,
        source: normalizedPayload.meta?.source || "booking-form",
      },
    };

    const sendBookingMessage = async () => {
      bookingSendRef.current.add(messageKey);
      try {
        const alreadyExists = await hasMessageWithBookingKey(
          selectedConversation.id,
          bookingKey
        );
        if (alreadyExists) {toast.error("Questa richiesta di prenotazione è già stata inviata"); return;};

        const messageId = await sendMessage(payloadToSend);
        if (!messageId) {
          bookingSendRef.current.delete(messageKey);
        }
      } catch (err) {
        bookingSendRef.current.delete(messageKey);
        setError(err);
      }
    };

    sendBookingMessage();
  }, [
    normalizedPayload,
    selectedConversation?.id,
    selectedConversation?.apartmentId,
    selectedConversation?.participants,
    userId,
    hostId,
    apartmentId,
    sendMessage,
  ]);

  return {
    selectedConversationId: selectedConversation?.id || null,
    status,
    error,
  };
};
