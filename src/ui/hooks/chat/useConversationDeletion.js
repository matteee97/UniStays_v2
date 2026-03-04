import { useState } from 'react';
import { toast } from 'sonner';

export const useConversationDeletion = ({ conversations, userId, deleteConversation, apartmentsData }) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openDelete = (conversationId) => {
    setConversationToDelete(conversationId);
    setDeleteModalOpen(true);
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setConversationToDelete(null);
  };

  const confirmDelete = async ({ selectedConversation, setSelectedConversation, navigate }) => {
    if (!conversationToDelete || !userId) return;

    const conversationToDeleteData = conversations.find((c) => c.id === conversationToDelete);
    if (!conversationToDeleteData?.participants?.includes(userId)) {
      toast.error('Non hai accesso a questa conversazione');
      cancelDelete();
      return;
    }

    setIsDeleting(true);
    try {
      await deleteConversation(conversationToDelete);
      toast.success('Conversazione rimossa con successo');

      if (selectedConversation?.id === conversationToDelete) {
        setSelectedConversation(null);
        const remaining = conversations.filter((c) => c.id !== conversationToDelete);
        if (remaining.length > 0) {
          const next = remaining[0];
          setSelectedConversation({ ...next, apartmentData: apartmentsData[next.apartmentId] });
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      toast.error('Errore nella rimozione della conversazione');
    } finally {
      setIsDeleting(false);
      cancelDelete();
    }
  };

  return {
    deleteModalOpen,
    conversationToDelete,
    isDeleting,
    openDelete,
    cancelDelete,
    confirmDelete,
  };
};


