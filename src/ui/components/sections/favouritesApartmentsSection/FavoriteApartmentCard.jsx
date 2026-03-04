import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { toast } from "sonner";
import { useNavigateToCity } from "@/ui/hooks";
import HeartToggle from "@/ui/components/common/buttons/HeartToggle";
import SmallCard from "@/ui/components/common/cards/SmallCard";
import { APARTMENT_STATUS } from "@/shared/types";

export default function FavoriteApartmentCard({ apartment }) {
  const { id, title, address, status } = apartment;
  const isPublished = status === APARTMENT_STATUS.PUBLISHED;
  const { user } = useUser();
  const [hovered, setHovered] = useState(false);
  const [liked, setLiked] = useState(true); // è nei preferiti all’inizio
  const goTo = useNavigateToCity();

  const handleClick = () => {
    if (!isPublished) return;
    const city = {
      city: address?.city,
      provinceCode: address?.provinceCode,
    };
    goTo(city, `/${id}`);
  };

  useEffect(() => {
    if (!isPublished) {
      toast.warning(
        `L'annuncio '${title}' a ${address?.city || "questa città"} non è più disponibile`
      );
    }
  }, [title, isPublished, address?.city]);

  return (
    <SmallCard
      imageChildren={
        hovered && (
          <HeartToggle
            app={apartment}
            userID={user?.id}
            apartmentId={id}
            liked={liked}
            setLiked={setLiked}
            position="absolute top-4 right-4 bg-white/80 border-2 border-[#D4F1EF] rounded-full py-4 px-5 z-10"
          />
        )
      }
      app={apartment}
      handleClick={handleClick}
      onHover={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      showCity
    >
      {!isPublished && (
        <p className="text-xs text-gray-500 mt-4 font-bold">
          Annuncio non più disponibile.
        </p>
      )}
    </SmallCard>
  );
}
