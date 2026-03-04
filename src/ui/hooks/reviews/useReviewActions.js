import { useCallback, useMemo, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { toast } from 'sonner';
import { addReview, toggleReviewLike, addReviewReply } from "@/infrastructure/firebase/adapters/reviews";

export function useReviewActions(apartment) {
  const { user } = useUser();
  const [submitting, setSubmitting] = useState(false);

  const apartmentId = apartment?.id;
  const currentUserId = user?.id;
  const isOwner = useMemo(() => {
    if (!apartment || !currentUserId) return false;
    return apartment?.ownerId === currentUserId;
  }, [apartment, currentUserId]);

  const submitReview = useCallback(async ({ rating5, text }) => {
    if (!apartmentId) return toast.error('Appartamento non valido');
    if (!currentUserId) return toast.error('Devi effettuare l\'accesso');
    if (!rating5 || !text) return toast.error('Compila tutti i campi');
    try {
      setSubmitting(true);
      await addReview(apartmentId, {
        userId: currentUserId,
        userName: user?.fullName || user?.username || 'Studente',
        rating5,
        text,
      });
      toast.success('Recensione inviata');
    } catch (e) {
      console.error(e);
      toast.error('Errore nell\'invio della recensione');
    } finally {
      setSubmitting(false);
    }
  }, [apartmentId, currentUserId, user]);

  const toggleLike = useCallback(async (review) => {
    if (!apartmentId) return;
    if (!currentUserId) return toast.error('Devi effettuare l\'accesso');
    const isLiked = (review?.likedBy || []).includes(currentUserId);
    try {
      await toggleReviewLike(apartmentId, review.id, currentUserId, isLiked);
    } catch (e) {
      console.error(e);
      toast.error('Errore nel mettere like');
    }
  }, [apartmentId, currentUserId]);

  const replyToReview = useCallback(async (reviewId, text) => {
    if (!apartmentId) return;
    if (!currentUserId) return toast.error('Devi effettuare l\'accesso');
    if (!text?.trim()) return toast.error('Inserisci un testo');
    try {
      await addReviewReply(apartmentId, reviewId, { userId: currentUserId, text, isOwner });
      toast.success('Risposta inviata');
    } catch (e) {
      console.error(e);
      toast.error('Errore nell\'invio della risposta');
    }
  }, [apartmentId, currentUserId, isOwner]);

  return { submitReview, toggleLike, replyToReview, submitting, isOwner };
}
