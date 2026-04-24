# Feature: Apartment page (dettaglio annuncio)

## Caricamento annuncio e owner

La pagina dettaglio carica il documento `apartments/{id}` e arricchisce i dati con informazioni owner (`usersPublic`) o fallback `ownerSnapshot`. La validazione ID evita accessi non validi.
File coinvolti: `src/ui/pages/Apartment.jsx`, `src/ui/hooks/fetches/useFetchApartment.js`, `src/ui/hooks/apartment/useApartment.js`, `src/ui/hooks/apartment/useApartmentOwner.js`, `src/core/ports/ApartmentRepository.js`

## Sezioni UI principali

La UI e' suddivisa in sezioni riusabili (hero, galleria immagini, info, regole, dotazioni, host info, stats). La sezione "Dove dormirai" mostra le stanze con card e modale di dettaglio. La form di booking e' sticky su desktop e richiede la selezione stanza quando ce ne sono piu' di una.
File coinvolti: `src/ui/components/sections/apartmentSection`, `src/ui/components/common/form/BookingForm.jsx`, `src/ui/components/sections/apartmentSection/ImageGallery.jsx`, `src/ui/components/sections/apartmentSection/ApartmentHero.jsx`, `src/ui/components/sections/apartmentSection/ApartmentInfo.jsx`, `src/ui/components/sections/apartmentSection/RoomPreviewSection.jsx`

## Roommate discovery (occupants)

La pagina dettaglio include la sezione "Chi vive gia qui", alimentata da `apartments/{apartmentId}/occupants` (solo record pubblicabili con consenso esplicito).  
La sezione visualizza card coinquilino con snapshot lifestyle (tag, interessi, lingue, presenza in casa), evitando di esporre dati privati.
File coinvolti: `src/ui/components/sections/apartmentSection/OccupantsSection.jsx`, `src/ui/hooks/fetches/useFetchApartment.js`, `src/infrastructure/firebase/repositories/FirestoreOccupantRepository.js`

## Recensioni e feedback

Le recensioni vengono lette da subcollection `reviews`, con supporto a risposte. Le azioni di like/reply aggiornano contatori nel documento review.
File coinvolti: `src/ui/hooks/fetches/useFetchRecensioni.js`, `src/infrastructure/firebase/adapters/reviews.js`, `src/ui/components/sections/apartmentSection/ApartmentFeedbackSection.jsx`, `src/ui/components/sections/apartmentSection/ReviewForm.jsx`

## Booking form e aggancio chat

Il submit della form genera un payload `booking-preview` con dati stanza (label, id, tipo, prezzo) e reindirizza alla chat con parametri URL. La preview immagine privilegia la foto della stanza selezionata. Il flusso completo e' documentato in `docs/features/booking-preview.md`.
File coinvolti: `src/ui/pages/Apartment.jsx`, `src/ui/components/common/form/BookingForm.jsx`, `src/ui/helpers/chatPayload.js`, `src/ui/pages/ChatPage.jsx`
