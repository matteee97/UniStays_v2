import { useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export const useContactForm = () => {
  const navigate = useNavigate();
  const formRef = useRef();
  const [loading, setLoading] = useState(false);
  const { reason } = useParams();

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    const data = new FormData(formRef.current);

    // Controllo anti-spam: se il campo nascosto è compilato, è un bot
    if (data.get("surname")) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      const emailjs = await import("@emailjs/browser");
      await emailjs.sendForm(
        "alloggi-universitari",
        "template_k9uuur5",
        formRef.current,
        {
          publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
        }
      );

      toast.success("Messaggio inviato con successo!");
      navigate("/");
    } catch (error) {
      console.error("Errore invio: ", error);
      toast.error("Errore durante l'invio. Riprova.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  return {
    formRef,
    loading,
    reason,
    handleSubmit,
  };
};
