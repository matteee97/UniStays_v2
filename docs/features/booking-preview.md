# Feature: Booking preview (messaggio di prenotazione in chat)

## Scopo e punti di ingresso
Dal dettaglio annuncio, l'utente invia una richiesta di prenotazione che viene trasformata in un messaggio speciale `booking-preview` e passata alla chat via query string.
File coinvolti: `src/ui/pages/Apartment.jsx`, `src/ui/pages/ChatPage.jsx`, `src/ui/helpers/chatPayload.js`

## Payload e encoding
Il payload viene normalizzato e codificato in base64url per il passaggio in URL (`payload`), poi decodificato in chat.
File coinvolti: `src/ui/helpers/chatPayload.js`, `src/ui/pages/Apartment.jsx`, `src/ui/pages/ChatPage.jsx`

Esempio payload `booking-preview`:
```json
{
  "type": "booking-preview",
  "content": "Buongiorno, sono interessato al suo appartamento \"Casa Campus\"...",
  "meta": {
    "title": "Casa Campus",
    "roomLabel": "Stanza 2 (Singola)",
    "roomId": "room_abcd1234",
    "roomType": "Singola",
    "roomPriceMonthly": 450,
    "date": "31/01/2025",
    "reason": "Richiesta di prenotazione per Stanza 2 (Singola) a partire dal 31/01/2025",
    "source": "booking-form",
    "previewImage": "https://.../cover.jpg",
    "bookingKey": "bk_abcd1234"
  }
}
```

## Invio e deduplica
La chat crea (o riusa) la conversazione per host+annuncio, poi invia il messaggio una sola volta grazie a `bookingKey` e query su Firestore. La chiave deriva da host+annuncio+data e, se presente, `roomId` (fallback: `roomsRequested`).
File coinvolti: `src/ui/hooks/chat/useChatBootstrapFromUrl.js`, `src/infrastructure/firebase/adapters/chat.js`, `src/ui/hooks/chat/useChat.js`

## Rendering UI
I messaggi `booking-preview` sono renderizzati con card dedicata (data, stanza, motivo) e preview immagine. La card preferisce `roomLabel` e usa `roomsRequested` solo come fallback per messaggi legacy.
File coinvolti: `src/ui/components/common/chat/messages/userChatMessage/UserChatMessage.jsx`, `src/ui/components/common/chat/messages/userChatMessage/parts/UserBookingPreviewCard.jsx`, `src/ui/components/common/chat/messages/userChatMessage/parts/UserMessageContent.jsx`
