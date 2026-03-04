import { useState, useEffect } from "react";
import ImageWithSkeleton from "../../ImageWithSkeleton";
import { useNavigateToCity } from "@/ui/hooks";
import AnnuncioCardContent from "./AnnuncioCardContent";
import AnnuncioActions from "./AnnuncioActions";
import Badge from "../../badges/Badge";

export default function AnnuncioCard({
  annuncio: annuncioProp,
  views = null,
  onDeleteAnnuncio,
}) {
  const goTo = useNavigateToCity();
  const [annuncio, setAnnuncioState] = useState(annuncioProp);
  const [hover, setHover] = useState(false);
  const [updateMode, setUpdateMode] = useState(false);
  const [roomsModalOpen, setRoomsModalOpen] = useState(false);
  const [apartmentModalOpen, setApartmentModalOpen] = useState(false);

  useEffect(() => {
    setAnnuncioState(annuncioProp);
  }, [annuncioProp]);

  const handleClick = () => {
    const city = {
      city: annuncio.address?.city,
      provinceCode: annuncio.address?.provinceCode,
    };
    goTo(city, `/${annuncio.id}`);
  };

  return (
    <div
      className={`transition-all duration-700 transform ease-in-out ${
        annuncio.isRemoving ? "opacity-0 -translate-x-full" : "opacity-100"
      } flex lg:flex-row space-y-4 lg:space-y-0 flex-col w-full h-fit lg:h-72 relative`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        if (!roomsModalOpen && !apartmentModalOpen) setUpdateMode(false);
      }}
    >
      <div
        className={`bg-white flex flex-col lg:flex-row rounded-xl dark:shadow-[0_7px_18px_rgba(0,0,0,0.2)] border-2 ${
          annuncio?.isFeatured ? "border-[#228E8D]" : "border-[#d4f1ef]"
        } 
          transition-all duration-500 ease-in-out
          w-full
          ${hover ? " lg:w-[calc(100%-134px)] " : " lg:w-full "}
          z-10 overflow-x-hidden
          `}
      >
        <div className="relative h-56 sm:h-72 lg:h-auto lg:w-5/12">
          {/* Immagine */}
          <ImageWithSkeleton
            src={annuncio.apartmentPhotoUrls?.[0]}
            alt={`Immagine di ${annuncio?.title}`}
            onClick={handleClick}
            rounded="rounded-none"
            aspectRatio="aspect-auto"
            containerClassName="h-full w-full cursor-pointer"
          />
          <div
            className={`opacity-50 pointer-events-none absolute right-0 top-0 h-full w-4 bg-gradient-to-r to-[#0000007e] via-[#00000025] from-transparent z-10`}
          ></div>
        </div>

        {/* Contenuto */}
        <AnnuncioCardContent
          annuncio={annuncio}
          updateMode={updateMode}
          views={views}
          setAnnuncioState={setAnnuncioState}
          setUpdateMode={setUpdateMode}
          roomsModalOpen={roomsModalOpen}
          setRoomsModalOpen={setRoomsModalOpen}
          apartmentModalOpen={apartmentModalOpen}
          setApartmentModalOpen={setApartmentModalOpen}
        />
        {annuncio?.isFeatured && (
          <div className="absolute top-2 left-2 z-10">
            <Badge size="xs" variant="primary" rounded="lg">
              In evidenza
            </Badge>
          </div>
        )}
      </div>
      {/* Bottoni a destra */}
      <AnnuncioActions
        annuncio={annuncio}
        setUpdateMode={setUpdateMode}
        updateMode={updateMode}
        onDeleteAnnuncio={onDeleteAnnuncio}
      />
    </div>
  );
}
