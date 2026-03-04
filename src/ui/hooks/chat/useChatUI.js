import { useState, useEffect } from 'react';
import useWindowWidth from '../ui/useWindowWidth';

export const useChatUI = () => {
  const width = useWindowWidth();
  const isMobile = width < 640;

  // Stati unificati
  const [showSidebar, setShowSidebar] = useState(!isMobile);
  const [showConversationsList, setShowConversationsList] = useState(!isMobile);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);

  // Gestisci il resize della finestra
  useEffect(() => {
    const isMobileNow = window.innerWidth < 640;
    setShowSidebar(!isMobileNow);
    setShowConversationsList(!isMobileNow);
  }, [width]);

  // Funzioni per gestire la selezione delle conversazioni
  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation);
    
    // Su mobile, chiudi la sidebar quando si seleziona una conversazione
    if (isMobile) {
      setShowSidebar(false);
      setShowConversationsList(false);
    }
  };

  const handleToggleSidebar = () => {
    setShowConversationsList(!showConversationsList);
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
  };

  return {
    // Stati
    showSidebar,
    showConversationsList,
    searchQuery,
    selectedConversation,
    isMobile,
    
    // Funzioni
    setShowSidebar,
    setShowConversationsList,
    setSearchQuery,
    setSelectedConversation,
    handleConversationClick,
    handleToggleSidebar,
    handleSearchChange,
  };
};
