import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function useNavigateToCity() {
  const navigate = useNavigate();

  const goTo = (city, add, newPage = false) => {
    if (!city || !city.city) {
      toast.error("Città non trovata, per favore riprova o contattaci.");
      console.error("Failed to navigate to city:", city);
      return;
    }

    const fallbackSigla = city.provinceCode || "";
    const citySlug =
      city.slug ||
      `${city.city.split("(")[0].trim()}${
        fallbackSigla ? `-${fallbackSigla.trim()}` : ""
      }`.toLowerCase();

    const url = `/alloggi/${citySlug}` + (add ?? "");
    if (newPage) {
      window.open(url, "_blank");
    } else {
      navigate(url, { state: { fromInternal: true } });
    }
  };

  return goTo;
}
