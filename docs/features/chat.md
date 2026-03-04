# Feature: Chat (conversazioni e messaggi)

## Conversazioni e messaggi
Le conversazioni sono documenti in `conversations` con partecipanti, lastMessage e unreadCount. I messaggi sono subcollection `messages` con type e metadata.
File coinvolti: `src/infrastructure/firebase/adapters/chat.js`, `firestore.rules`

## Hook e UI
`useChat` gestisce listeners realtime per conversazioni e messaggi, mentre `ChatPage` coordina UI, selezione conversazione e invio. I componenti chat implementano rendering, header e lista conversazioni.
File coinvolti: `src/ui/hooks/chat/useChat.js`, `src/ui/pages/ChatPage.jsx`, `src/ui/components/common/chat`, `src/ui/hooks/chat/useChatSelection.js`

## Read/unread e rimozione conversazioni
La lettura aggiorna `isRead` sui messaggi e `unreadCount` sulla conversazione. La rimozione e' una soft delete: l'utente viene rimosso dai partecipanti e, se resta solo uno, la conversazione viene eliminata.
File coinvolti: `src/infrastructure/firebase/adapters/chat.js`, `src/ui/hooks/chat/useConversationDeletion.js`, `src/ui/pages/ChatPage.jsx`

## Notifiche piattaforma
Messaggi platform sono separati in `platformConversations` e vengono gestiti da hook dedicato per badge/lettura.
File coinvolti: `src/infrastructure/firebase/adapters/platformMessages.js`, `src/ui/hooks/chat/usePlatformMessages.js`, `firestore.rules`
