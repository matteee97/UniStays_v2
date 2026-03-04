import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';

/**
 * Hook per gestire la presenza online/offline degli utenti
 */
export const usePresence = () => {
  const { user } = useUser();
  const userId = user?.id;
  const [isOnline, setIsOnline] = useState(false);



  // Setup iniziale semplificato
  useEffect(() => {
    if (!userId) return;

    // Imposta come online quando l'utente è attivo
    setIsOnline(true);

    // Gestione chiusura della pagina
    const handleBeforeUnload = () => {
      setIsOnline(false);
    };

    // Aggiungi event listener
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      setIsOnline(false);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [userId]);

  return {
    // Stati
    isOnline
  };
};
