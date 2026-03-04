# Chat Components - Super Riutilizzabili

Questi componenti sono stati progettati per essere **super riutilizzabili** e **altamente configurabili** per qualsiasi scenario di chat.

## 🎴 ConversationCard

Componente per visualizzare una singola conversazione con massima flessibilità.

### Esempi di utilizzo:

```jsx
// Card grande standard
<ConversationCard
  conversation={conversation}
  participantName="Mario Rossi"
  participantAvatar="https://example.com/avatar.jpg"
  onClick={() => handleClick(conversation)}
  isActive={true}
/>

// Card compatta per sidebar
<ConversationCard
  conversation={conversation}
  participantName="Mario Rossi"
  size="small"
  variant="compact"
  onClick={() => handleClick(conversation)}
/>

// Card personalizzata con formattazione tempo custom
<ConversationCard
  conversation={conversation}
  participantName="Mario Rossi"
  size="medium"
  customTimeFormat={(timestamp) => formatCustomTime(timestamp)}
  customStyles={{ backgroundColor: '#f0f0f0' }}
  onClick={() => handleClick(conversation)}
/>

// Card in loading state
<ConversationCard
  conversation={conversation}
  participantName="Mario Rossi"
  loading={true}
/>
```

### Props disponibili:

- `size`: "small" | "medium" | "large"
- `variant`: "compact" | "default" | "detailed"
- `showTime`: boolean
- `showLastMessage`: boolean
- `showApartmentTitle`: boolean
- `customTimeFormat`: function
- `customStyles`: object
- `disabled`: boolean
- `loading`: boolean

## 🎯 ChatHeader

Header universale per qualsiasi tipo di chat con azioni personalizzabili.

### Esempi di utilizzo:

```jsx
// Header standard
<ChatHeader
  title="Mario Rossi"
  subtitle="Appartamento: Casa Bella"
  avatar={<img src="avatar.jpg" alt="Mario" />}
  onClose={() => setOpen(false)}
/>

// Header compatto con tema scuro
<ChatHeader
  title="Chat"
  variant="compact"
  theme="dark"
  titleSize="lg"
/>

// Header con azioni personalizzate
<ChatHeader
  title="Chat Gruppo"
  actions={[
    { icon: faPhone, onClick: () => startCall(), title: "Chiama" },
    { icon: faVideo, onClick: () => startVideo(), title: "Video" },
    { icon: faInfo, onClick: () => showInfo(), title: "Info" }
  ]}
/>

// Header con ricerca
<ChatHeader
  title="Chat"
  showSearch={true}
  searchQuery={searchQuery}
  onSearchChange={setSearchQuery}
  onToggleSearch={() => setShowSearch(!showSearch)}
/>
```

### Props disponibili:

- `variant`: "default" | "compact" | "minimal"
- `theme`: "light" | "dark" | "gradient"
- `titleSize`: "sm" | "md" | "lg" | "xl" | "2xl"
- `actions`: array di azioni personalizzate
- `sticky`: boolean
- `showSubtitle`: boolean

## 🏠 ChatContainer

Componente principale che combina tutti gli altri per creare un'interfaccia chat completa.

### Esempi di utilizzo:

```jsx
// Chat fullscreen standard
<ChatContainer
  layout="fullscreen"
  conversations={conversations}
  activeConversation={activeConversation}
  conversationMessages={messages}
  onSendMessage={handleSendMessage}
  onConversationClick={handleConversationClick}
/>

// Chat in modal
<ChatContainer
  layout="modal"
  variant="compact"
  conversations={conversations}
  activeConversation={activeConversation}
  onClose={() => setModalOpen(false)}
/>

// Chat embedded in sidebar
<ChatContainer
  layout="sidebar"
  conversations={conversations}
  showSidebar={false}
  theme="dark"
/>

// Chat con configurazione completa
<ChatContainer
  layout="fullscreen"
  variant="default"
  theme="gradient"
  conversations={conversations}
  activeConversation={activeConversation}
  conversationMessages={messages}
  usersData={usersData}
  userId={userId}
  headerTitle="Chat Supporto"
  headerSubtitle="Siamo qui per aiutarti"
  headerAvatar={<SupportAvatar />}
  loading={loading}
  chatLoading={chatLoading}
  sending={sending}
  error={error}
  onConversationClick={handleConversationClick}
  onSendMessage={handleSendMessage}
  onClose={() => setOpen(false)}
  onExploreApartments={() => navigate('/apartments')}
  showSidebar={true}
  showSearch={true}
  showConversationsList={showList}
  searchQuery={searchQuery}
  onSearchChange={setSearchQuery}
  isMyMessage={isMyMessage}
  initialMessageText="Ciao, ho bisogno di aiuto..."
/>
```

### Layout disponibili:

- `fullscreen`: Schermo intero
- `sidebar`: Sidebar laterale
- `modal`: Modal popup
- `embedded`: Embedded in pagina

## 🎨 Personalizzazione Avanzata

### Temi personalizzati:

```jsx
// Tema personalizzato
<ChatContainer
  theme="custom"
  customStyles={{
    "--primary-color": "#your-color",
    "--secondary-color": "#your-secondary",
    "--background": "#your-bg",
  }}
/>
```

### Styling condizionale:

```jsx
<ConversationCard
  conversation={conversation}
  participantName={name}
  customStyles={{
    backgroundColor: isUrgent ? "#ffebee" : "white",
    borderLeft: isUrgent ? "4px solid #f44336" : "none",
  }}
  onClick={handleClick}
/>
```

## 📱 Responsive Design

Tutti i componenti sono completamente responsive e si adattano automaticamente a:

- Desktop (layout completo)
- Tablet (layout compatto)
- Mobile (layout minimal)

## 🔧 Estensibilità

I componenti sono progettati per essere facilmente estendibili:

```jsx
// Estendi ConversationCard
const CustomConversationCard = ({ conversation, ...props }) => (
  <ConversationCard
    {...props}
    conversation={conversation}
    customStyles={{
      ...props.customStyles,
      // I tuoi stili personalizzati
    }}
  />
);

// Estendi ChatContainer
const CustomChatContainer = (props) => (
  <ChatContainer
    {...props}
    layout="custom"
    customStyles={{
      ...props.customStyles,
      // I tuoi stili personalizzati
    }}
  />
);
```

## 🚀 Performance

- **Lazy loading**: I componenti si caricano solo quando necessario
- **Memoization**: Props ottimizzate per evitare re-render inutili
- **Virtualization**: Lista conversazioni virtualizzata per performance
- **Debounced search**: Ricerca ottimizzata con debounce

## 📚 TypeScript Support

Tutti i componenti includono PropTypes completi e sono pronti per TypeScript:

```typescript
interface ConversationCardProps {
  conversation: Conversation;
  participantName: string;
  participantAvatar?: string;
  onClick: (conversation: Conversation) => void;
  size?: "small" | "medium" | "large";
  variant?: "compact" | "default" | "detailed";
  // ... altre props
}
```
