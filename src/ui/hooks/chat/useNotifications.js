import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';

/**
 * Hook per gestire le notifiche push e desktop
 */
export const useNotifications = () => {
  const { user } = useUser();
  const [permission, setPermission] = useState('default');
  const [isSupported, setIsSupported] = useState(false);
  const notificationRef = useRef(null);

  // Controlla se le notifiche sono supportate
  useEffect(() => {
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  // Richiedi permessi per le notifiche
  const requestPermission = async () => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Errore richiesta permessi notifiche:', error);
      return false;
    }
  };

  // Mostra una notifica
  const showNotification = (title, options = {}) => {
    if (!isSupported || permission !== 'granted') return null;

    const defaultOptions = {
      icon: '/icons/UniMarker.svg',
      badge: '/icons/UniMarker.svg',
      tag: 'unistays-chat',
      requireInteraction: false,
      silent: false,
      ...options
    };

    try {
      const notification = new Notification(title, defaultOptions);
      
      // Auto-close dopo 5 secondi
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Gestisci click sulla notifica
      notification.onclick = () => {
        window.focus();
        notification.close();
        
        // Qui potresti aprire la chat o navigare alla conversazione
        if (options.onClick) {
          options.onClick();
        }
      };

      notificationRef.current = notification;
      return notification;
    } catch (error) {
      console.error('Errore creazione notifica:', error);
      return null;
    }
  };

  // Mostra notifica per nuovo messaggio
  const showMessageNotification = (senderName, messageContent, conversationId) => {
    const title = `Nuovo messaggio da ${senderName}`;
    const body = messageContent.length > 50 
      ? messageContent.substring(0, 50) + '...' 
      : messageContent;

    return showNotification(title, {
      body,
      icon: '/icons/UniMarker.svg',
      badge: '/icons/UniMarker.svg',
      tag: `chat-${conversationId}`,
      requireInteraction: true,
      onClick: () => {
        // Qui potresti aprire la chat e la conversazione specifica
        console.log('Apri conversazione:', conversationId);
      }
    });
  };

  // Mostra notifica per nuova conversazione
  const showConversationNotification = (hostName, apartmentTitle) => {
    const title = `Nuova conversazione con ${hostName}`;
    const body = apartmentTitle ? `Per l'appartamento: ${apartmentTitle}` : 'Hai iniziato una nuova conversazione';

    return showNotification(title, {
      body,
      icon: '/icons/UniMarker.svg',
      badge: '/icons/UniMarker.svg',
      tag: 'new-conversation',
      requireInteraction: true
    });
  };

  // Chiudi tutte le notifiche
  const closeAllNotifications = () => {
    if (notificationRef.current) {
      notificationRef.current.close();
      notificationRef.current = null;
    }
  };

  // Controlla se il browser è in focus
  const isBrowserFocused = () => {
    return document.hasFocus();
  };

  // Controlla se la pagina è visibile
  const isPageVisible = () => {
    return !document.hidden;
  };

  return {
    // Stati
    permission,
    isSupported,
    canNotify: isSupported && permission === 'granted',
    
    // Funzioni
    requestPermission,
    showNotification,
    showMessageNotification,
    showConversationNotification,
    closeAllNotifications,
    isBrowserFocused,
    isPageVisible
  };
};
