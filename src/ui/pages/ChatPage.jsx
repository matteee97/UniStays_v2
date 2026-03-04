import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { toast } from "sonner";

import {
  useChat,
  useChatSelection,
  useConversationDeletion,
  useChatUI,
  useNavigateToCity,
  useChatBootstrapFromUrl,
} from "@/ui/hooks";

import { ChatContainer } from "@/ui/components/common/chat";
import ChatLoading from "@/ui/components/common/chat/ChatLoading";
import ChatAccessDenied from "@/ui/components/common/chat/ChatAccessDenied";
import ConfirmModal from "@/ui/components/common/modals/ConfirmModal";
import {
  decodeChatPayload,
  normalizeChatPayload,
} from "@/ui/helpers/chatPayload";

const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const userId = user?.id;
  const goTo = useNavigateToCity();

  // Parametri dalla URL
  const hostId = searchParams.get("hostId");
  const apartmentId = searchParams.get("apartmentId");
  const payloadParam = searchParams.get("payload");

  // Stati
  const [initialMessageText, setInitialMessageText] = useState("");

  // Hook per gestire l'UI della chat
  const {
    showSidebar,
    showConversationsList,
    searchQuery,
    selectedConversation,
    isMobile,
    handleConversationClick,
    handleToggleSidebar,
    handleSearchChange,
    setSelectedConversation,
  } = useChatUI();

  // Chat hook
  const {
    conversations,
    messages,
    loading: chatLoading,
    error,
    sending,
    startConversation,
    isMyMessage,
    usersData,
    apartmentsData,
    markMessagesAsReadManually,
    deleteConversation,
    sendMessage,
  } = useChat(selectedConversation?.id || null);

  // Gestione selezione conversazioni e stati derivati
  const {
    activeConversation,
    isUserParticipant,
    isConversationDisabled,
    ensureSelectedStillValid,
  } = useChatSelection({
    conversations,
    apartmentsData,
    userId,
    hostId,
    apartmentId,
    markMessagesAsRead: markMessagesAsReadManually,
    externalSelectedConversation: selectedConversation,
    setExternalSelectedConversation: setSelectedConversation,
  });

  // Gestione eliminazione conversazioni
  const {
    deleteModalOpen,
    isDeleting,
    openDelete,
    cancelDelete,
    confirmDelete,
    conversationToDelete,
  } = useConversationDeletion({
    conversations,
    userId,
    deleteConversation,
    apartmentsData,
  });

  const decodedPayload = useMemo(
    () => decodeChatPayload(payloadParam),
    [payloadParam],
  );

  const messageDraft = useMemo(
    () => normalizeChatPayload(decodedPayload),
    [decodedPayload],
  );

  useEffect(() => {
    const isBootstrapConversation =
      !!messageDraft &&
      !!selectedConversation &&
      selectedConversation.apartmentId === apartmentId &&
      (!hostId || selectedConversation.participants?.includes(hostId));

    if (!messageDraft || messageDraft.type === "booking-preview") {
      setInitialMessageText("");
      return;
    }

    if (!isBootstrapConversation) {
      setInitialMessageText("");
      return;
    }

    setInitialMessageText(messageDraft.content);
  }, [messageDraft, selectedConversation, apartmentId, hostId]);

  useChatBootstrapFromUrl({
    hostId,
    apartmentId,
    userId,
    payload: messageDraft,
    conversations,
    apartmentsData,
    selectedConversation,
    setSelectedConversation,
    startConversation,
    sendMessage,
  });

  // Monitora disponibilità conversazione selezionata
  useEffect(() => {
    ensureSelectedStillValid(() => {
      navigate("/");
      toast.info("Non ci sono più conversazioni disponibili");
    });
  }, [conversations, ensureSelectedStillValid, navigate]);

  // Se l'utente non è un partecipante della conversazione, mostra errore
  if (activeConversation && !isUserParticipant) {
    return <ChatAccessDenied onBack={() => navigate(-1)} />;
  }

  // Loading
  if (chatLoading) {
    return <ChatLoading />;
  }

  // Se non ci sono parametri URL e non ci sono conversazioni, mostra la chat con fallback
  if (!hostId && !apartmentId && conversations.length === 0) {
    return (
      <>
        <ChatContainer
          // Configurazione layout
          layout="fullscreen"
          variant="default"
          // Dati
          conversations={conversations}
          activeConversation={null}
          conversationMessages={[]}
          usersData={usersData}
          apartmentsData={apartmentsData}
          userId={userId}
          // Header
          headerApartmentId={null}
          headerTitle="Chat"
          headerSubtitle="Le tue conversazioni"
          headerAvatar={null}
          // Stati
          loading={false}
          chatLoading={false}
          sending={sending}
          error={error}
          // Funzioni
          onConversationClick={() => {}}
          onSendMessage={() => {}}
          onClose={() => navigate(-1)}
          onExploreApartments={() => navigate("/")}
          onTitleClick={() => {}}
          onDeleteConversation={() => {}}
          // Configurazioni
          showSidebar={showSidebar}
          showSearch={true}
          showConversationsList={showConversationsList}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          isMobile={isMobile}
          // Props per componenti figli
          isMyMessage={isMyMessage}
          initialMessageText=""
          isConversationDisabled={false}
          activeConversationId={null}
          isUserParticipant={true}
          hasConversations={false}
        />
      </>
    );
  }

  return (
    <>
      <ChatContainer
        // Configurazione layout
        layout="fullscreen"
        variant="default"
        // Dati
        conversations={conversations}
        activeConversation={activeConversation}
        conversationMessages={messages}
        usersData={usersData}
        apartmentsData={apartmentsData}
        userId={userId}
        // Header
        headerApartmentId={activeConversation?.apartmentId}
        headerTitle={activeConversation?.apartmentData?.title || "Alloggio"}
        headerSubtitle={
          activeConversation?.apartmentData?.address
            ? `${activeConversation.apartmentData.address.street || ""}, ${
                activeConversation.apartmentData.address.city || ""
              }`
            : "Via non specificata"
        }
        headerAvatar={
          activeConversation?.apartmentData?.apartmentPhotoUrls?.[0]
        }
        // Stati
        loading={chatLoading}
        chatLoading={chatLoading}
        sending={sending}
        error={error}
        // Funzioni
        onConversationClick={(conversation) => {
          // Aggiungi i dati dell'appartamento alla conversazione selezionata
          const conversationWithApartmentData = {
            ...conversation,
            apartmentData: apartmentsData[conversation.apartmentId],
          };

          // Usa la funzione del hook per gestire la selezione
          handleConversationClick(conversationWithApartmentData);
          setInitialMessageText("");
          if (hostId || apartmentId || payloadParam) {
            navigate("/chat", { replace: true });
          }

          // Marca i messaggi come letti quando si seleziona una conversazione
          setTimeout(() => {
            markMessagesAsReadManually(conversation.id);
          }, 500);
        }}
        onSendMessage={async (payload) => {
          if (!activeConversation?.id || !userId) {
            toast.error("Errore nell'invio del messaggio");
            console.error("Non ci sono dati per l'invio del messaggio");
            return;
          }

          // Verifica che l'utente sia ancora un partecipante
          if (!isUserParticipant) {
            toast.error("Non hai più accesso a questa conversazione");
            return;
          }

          try {
            const messageId = await sendMessage(payload);
            if (!messageId) {
              toast.error("Messaggio non valido");
            }
          } catch (error) {
            toast.error("Errore nell'invio del messaggio");
            console.error(error);
          }
        }}
        onClose={() => navigate(-1)}
        onExploreApartments={() => navigate("/")}
        onTitleClick={(apartmentId) => {
          const city = {
            city: activeConversation?.apartmentData?.address?.city,
            provinceCode:
              activeConversation?.apartmentData?.address?.provinceCode,
          };
          goTo(city, `/${apartmentId}`);
        }}
        onDeleteConversation={openDelete}
        // Configurazioni
        showSidebar={showSidebar}
        showSearch={true}
        showConversationsList={showConversationsList}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        isMobile={isMobile}
        onToggleSidebar={handleToggleSidebar}
        // Props per componenti figli
        isMyMessage={isMyMessage}
        initialMessageText={initialMessageText}
        isConversationDisabled={isConversationDisabled}
        activeConversationId={activeConversation?.id}
        isUserParticipant={isUserParticipant}
        hasConversations={conversations.length > 0}
        onCreateConversation={
          hostId && apartmentId
            ? async () => {
                try {
                  const existingConversation = conversations.find(
                    (conv) =>
                      conv.participants.includes(userId) &&
                      conv.participants.includes(hostId) &&
                      conv.apartmentId === apartmentId,
                  );
                  if (existingConversation) {
                    setSelectedConversation({
                      ...existingConversation,
                      apartmentData:
                        apartmentsData[existingConversation.apartmentId],
                    });
                    return;
                  }

                  const conversationId = await startConversation(
                    hostId,
                    apartmentId,
                  );
                  if (conversationId) {
                    setSelectedConversation({
                      id: conversationId,
                      participants: [userId, hostId],
                      apartmentId,
                      apartmentData: apartmentsData[apartmentId],
                    });
                  }
                } catch (error) {
                  toast.error("Errore nella creazione della conversazione");
                  console.error("Errore nella creazione della conversazione", error);
                }
              }
            : null
        }
      />

      {/* Modal di conferma eliminazione */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={cancelDelete}
        onConfirm={() =>
          confirmDelete({
            selectedConversation,
            setSelectedConversation,
            navigate,
          })
        }
        title="Rimuovi conversazione"
        description={`Sei sicuro di voler rimuovere questa conversazione? ${(() => {
          const conversation = conversations?.find(
            (conv) => conv.id === conversationToDelete,
          );
          const count = Object.keys(conversation?.participants || {}).length;

          if (count === 1) {
            return "Questa chat verrà eliminata definitivamente.";
          } else if (count === 2) {
            return "L'altro partecipante potrà comunque accedervi.";
          } else {
            return "Gli altri partecipanti potranno comunque accedervi.";
          }
        })()}`}
        confirmText="Sono sicuro, rimuovi"
        cancelText="No, annulla"
        loading={isDeleting}
      />
    </>
  );
};

export default ChatPage;
