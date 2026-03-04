import { useState } from "react";
import CloseButton from "../buttons/CloseButton";
import CardImageSlider from "./CardImageSlider";
import { useNavigateToCity } from "@/ui/hooks";
import { getPriceRangeLabel } from "@/ui/helpers/apartmentPricing";
import { HeartToggle } from "..";
import { useUser } from "@clerk/clerk-react";
export default function InMapApartmentsCard({
  selectedApartment,
  setSelectedApartment,
  liked,
}) {
  const [hover, setHover] = useState(false);
  const goTo = useNavigateToCity();
  const { user } = useUser();
  const userId = user?.id;

  const handleClick = () => {
    const city = {
      city: selectedApartment.address?.city,
      provinceCode: selectedApartment.address?.provinceCode,
    };
    goTo(city, `/${selectedApartment.id}`);
  };
  return (
    <div
      onClick={handleClick}
      className="block text-left bg-white border-2 border-[#D4F1EF] rounded-xl shadow-lg py-2 px-3 w-[274px] text-sm relative"
    >
      <div className="w-full flex items-center justify-between ">
        <h2
          className="text-lg font-bold mb-2 text.gray-600 line-clamp-1 max-w-48"
          title={selectedApartment.title}
        >
          {selectedApartment.title}
        </h2>

        <CloseButton
          onClick={() => {
            setSelectedApartment(null);
          }}
        />
      </div>

      <CardImageSlider
        images={[...(selectedApartment.apartmentPhotoUrls ?? [])]}
        dimensions={"w-full h-40 my-2"}
        alt={selectedApartment.title}
        onHoverIn={() => setHover(true)}
        onHoverOut={() => setHover(false)}
      />

      <div className="w-full flex items-center justify-between ">
        <p className="text-[#228E8D] font-bold text-lg">
          {getPriceRangeLabel(selectedApartment.aggregates) || "€—"} /mese
        </p>
        <HeartToggle liked={liked} userID={userId} app={selectedApartment} />
      </div>
    </div>
  );
}
