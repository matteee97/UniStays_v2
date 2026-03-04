import PropTypes from "prop-types";
import ChatHeader from "./ChatHeader";
import ChatConversationList from "./ChatConversationList";
import ChatMessagesArea from "./ChatMessagesArea";
import ChatInput from "./ChatInput";
import LoadingIcon from "../shared/icons/LoadingIcon";
import SearchInput from "../form/SearchInput";
import Alert from "../messages/PubblicaAnnuncioAlert";
import InfoToggle from "../indicators/InfoToggle";

const ChatContainer = ({
  // Configurazione layout
  layout = "fullscreen", // "fullscreen" | "sidebar" | "modal" | "embedded"
  variant = "default", // "default" | "compact" | "minimal"

  // Dati
  conversations = [],
  activeConversation = null,
  conversationMessages = [],
  usersData = {},
  apartmentsData = {},
  userId = "",

  // Header
  headerApartmentId = "",
  headerTitle = "Chat",
  headerSubtitle = "",
  headerAvatar = null,

  // Stati
  loading = false,
  chatLoading = false,
  sending = false,
  error = null,

  // Funzioni
  onConversationClick = () => {},
  onSendMessage = () => {},
  onClose = () => {},
  onTitleClick = () => {},
  onDeleteConversation = () => {},

  // Configurazioni
  showConversationsList = false,
  searchQuery = "",
  onSearchChange = () => {},
  onToggleSidebar = () => {},

  // Styling
  className = "",
  customStyles = {},
  theme = "light",

  // Props per componenti figli
  isMyMessage = () => false,
  initialMessageText = "",
  isConversationDisabled = false,
  activeConversationId = null,
  isUserParticipant = true,
  hasConversations = true,
  onCreateConversation = null,
  isMobile = false,
}) => {
  // Configurazione layout
  const layoutConfig = {
    fullscreen: "fixed inset-0 bg-white flex flex-col ",
    sidebar: "w-80 bg-white border-r border-gray-200 flex flex-col",
    modal: "fixed inset-4 bg-white rounded-2xl shadow-2xl flex flex-col",
    embedded: "w-full h-full bg-white flex flex-col",
  };

  const MOBILE_HEADER_OFFSET = 82; // Altezza header mobile (82px)
  const conversationPanelClasses = `flex flex-col w-full bg-white backdrop-blur-sm ${
    isMobile
      ? "fixed inset-x-0 z-40 shadow-2xl border-b border-[#d4f1ef] touch-pan-y overflow-hidden"
      : "relative w-full sm:w-80 border-r-2 border-[#d4f1ef]"
  }`;
  const conversationPanelStyle = isMobile
    ? { top: `${MOBILE_HEADER_OFFSET}px`, bottom: 0 }
    : undefined;

  // Filtra conversazioni per ricerca
  const filteredConversations = conversations.filter((conversation) => {
    if (!searchQuery) return true;

    const otherId = conversation.participants.find((id) => id !== userId);
    const otherUserData = usersData[otherId];
    const participantName =
      otherUserData?.displayName ||
      [otherUserData?.firstName, otherUserData?.lastName]
        .filter(Boolean)
        .join(" ") ||
      "Host";
    const apartmentTitle = conversation.apartmentTitle || "";
    const lastMessage = conversation.lastMessage || "";

    return (
      participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apartmentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (loading) {
    return <LoadingIcon />;
  }

  if (error) {
    return <Alert className="flex-1">{error}</Alert>;
  }

  return (
    <div
      className={`${layoutConfig[layout]} ${className}`}
      style={customStyles}
    >
      {/* Header */}
      <ChatHeader
        apartmentId={headerApartmentId}
        title={headerTitle}
        subtitle={headerSubtitle}
        avatar={headerAvatar}
        onToggleList={onToggleSidebar}
        onClose={onClose}
        variant={variant}
        theme={theme}
        onTitleClick={onTitleClick}
      />

      {/* Content */}
      <div className="flex-1 flex min-h-0 relative ">
        <div className="absolute bg-white w-full sm:w-[calc(320px-2px)]  h-1 -top-1 left-0 z-20"></div>
        {/* Sidebar delle conversazioni */}
        {showConversationsList && (
          <div
            className={conversationPanelClasses}
            style={conversationPanelStyle}
          >
            {/* Barra di ricerca */}
            <div className="pt-4 px-4">
              <SearchInput
                id="search-conversation"
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Cerca conversazioni..."
                searchTerm={searchQuery}
                className="w-full"
              />
            </div>

            <div
              className=" flex-1 overflow-y-auto touch-pan-y"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {!hasConversations ? (
                <Alert className="m-4">
                  <p className="text-sm mr-4 text-gray-500">
                    Non hai ancora nessuna conversazione
                  </p>
                </Alert>
              ) : filteredConversations.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <p className="text-sm">
                    {searchQuery
                      ? "Nessuna conversazione trovata"
                      : "Nessuna conversazione"}
                  </p>
                </div>
              ) : (
                <ChatConversationList
                  conversations={filteredConversations}
                  onConversationClick={onConversationClick}
                  onDeleteConversation={onDeleteConversation}
                  activeConversation={activeConversation}
                  usersData={usersData}
                  apartmentsData={apartmentsData}
                  userId={userId}
                />
              )}
            </div>
          </div>
        )}

        {/* Chat principale */}
        <div
          className="flex-1 flex flex-col sm:pt-0 relative min-h-0 overflow-hidden"
          style={{ top: isMobile && `${MOBILE_HEADER_OFFSET}px` }}
        >
          {/* Info sulla sicurezza */}
          <InfoToggle className="absolute left-4 top-4 max-w-xs z-20">
            <ul className="list-disc list-inside space-y-1">
              <li>
                Non inviare documenti, dati di pagamento, password o altre
                informazioni sensibili nella chat.
              </li>
              <li>
                Verifica identità e dettagli dell'annuncio di persona: accordi e
                pagamenti restano tra te e l'host.
              </li>
              <li>
                La piattaforma non gestisce pagamenti o verifiche: usa canali
                sicuri e segnala attività sospette.
              </li>
            </ul>
          </InfoToggle>

          {/* Area messaggi */}
          <ChatMessagesArea
            conversationMessages={conversationMessages}
            avatar={
              activeConversation
                ? activeConversation.isPlatformConversation
                  ? "/img/logoFullColor.webp"
                  : usersData[
                      activeConversation.participants.find(
                        (id) => id !== userId,
                      )
                    ]?.photoUrl
                : undefined
            }
            chatLoading={chatLoading}
            isMyMessage={isMyMessage}
            onDeleteConversation={() =>
              onDeleteConversation(activeConversationId)
            }
            isUserParticipant={isUserParticipant}
            hasConversations={hasConversations}
            onCreateConversation={onCreateConversation}
            activeConversation={activeConversation}
          />

          {/* Input */}
          <div className="p-4 fixed bottom-0 left-0 sm:left-[318px] w-full sm:w-[calc(100%-318px)] space-y-3 z-10">
            <ChatInput
              onSendMessage={onSendMessage}
              disabled={
                sending ||
                isConversationDisabled ||
                !isUserParticipant ||
                !hasConversations ||
                activeConversation?.isPlatformConversation === true
              }
              placeholder={
                activeConversation?.isPlatformConversation === true
                  ? "Non puoi inviare messaggi alla piattaforma"
                  : !hasConversations
                    ? "Non hai ancora nessuna conversazione"
                    : !isUserParticipant
                      ? "Non hai accesso a questa conversazione"
                      : isConversationDisabled
                        ? "Non puoi più inviare messaggi in questa conversazione"
                        : "Scrivi un messaggio..."
              }
              initialValue={initialMessageText}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

ChatContainer.propTypes = {
  // Configurazione layout
  layout: PropTypes.oneOf(["fullscreen", "sidebar", "modal", "embedded"]),
  variant: PropTypes.oneOf(["default", "compact", "minimal"]),

  // Dati
  conversations: PropTypes.array,
  activeConversation: PropTypes.object,
  conversationMessages: PropTypes.array,
  usersData: PropTypes.object,
  userId: PropTypes.string,

  // Header
  headerTitle: PropTypes.string,
  headerSubtitle: PropTypes.string,
  headerAvatar: PropTypes.node,

  // Stati
  loading: PropTypes.bool,
  chatLoading: PropTypes.bool,
  sending: PropTypes.bool,
  error: PropTypes.string,

  // Funzioni
  onConversationClick: PropTypes.func,
  onSendMessage: PropTypes.func,
  onClose: PropTypes.func,
  onExploreApartments: PropTypes.func,
  onDeleteConversation: PropTypes.func,

  // Configurazioni
  showSidebar: PropTypes.bool,
  showSearch: PropTypes.bool,
  showConversationsList: PropTypes.bool,
  searchQuery: PropTypes.string,
  onSearchChange: PropTypes.func,
  onToggleSidebar: PropTypes.func,
  isMobile: PropTypes.bool,

  // Styling
  className: PropTypes.string,
  customStyles: PropTypes.object,
  theme: PropTypes.oneOf(["light", "dark", "gradient"]),

  // Props per componenti figli
  isMyMessage: PropTypes.func,
  initialMessageText: PropTypes.string,
  onInitialMessageChange: PropTypes.func,
};

export default ChatContainer;
