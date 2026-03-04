import { useState, useEffect, useCallback } from 'react';

/**
 * Hook per gestire il comportamento del progress bar durante lo scroll
 * @param {number} threshold - Soglia di scroll per attivare la modalità compatta (default: 100)
 * @returns {Object} Oggetto con stato scroll e metodi utility
 */
export const useScrollProgress = (threshold = 100) => {
  const [scrollY, setScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  // Gestisce lo scroll con throttling ottimizzato
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    setScrollY(currentScrollY);
    
    // Usa una soglia con isteresi per evitare flicker
    const newIsScrolled = currentScrollY > threshold;
    if (newIsScrolled !== isScrolled) {
      setIsScrolled(newIsScrolled);
    }
  }, [threshold, isScrolled]);

  useEffect(() => {
    let ticking = false;
    
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [handleScroll]);

  // Calcola la percentuale di scroll della pagina
  const scrollPercentage = useCallback(() => {
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    return documentHeight > 0 ? Math.min((scrollY / documentHeight) * 100, 100) : 0;
  }, [scrollY]);

  return {
    scrollY,
    isScrolled,
    scrollPercentage: scrollPercentage(),
    shouldCompact: isScrolled
  };
};
