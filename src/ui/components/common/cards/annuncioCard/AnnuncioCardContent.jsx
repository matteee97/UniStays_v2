import AnnuncioUpdate from "./AnnuncioUpdate";
import AnnuncioDetails from "./AnnuncioDetails";
import { useInView } from "@/ui/hooks";

export default function AnnuncioCardContent({
  annuncio,
  views,
  updateMode,
  setAnnuncioState,
  setUpdateMode,
  roomsModalOpen,
  setRoomsModalOpen,
  apartmentModalOpen,
  setApartmentModalOpen,
}) {
  const [ref, isVisible] = useInView({ threshold: 0 });
  return (
    <div
      className={`flex flex-col lg:flex-row w-full h-full border-t-2 lg:border-t-0 lg:border-l-2 ${
        annuncio?.isFeatured ? " border-[#228E8D]" : "border-[#d4f1ef]"
      }  relative overflow-x-hidden`}
    >
      <div
        className={`opacity-50 pointer-events-none absolute left-0 top-0 h-full w-4 bg-gradient-to-r from-white/75 dark:from-[#0F1829] dark:to-transparent to-transparent z-10`}
      ></div>

      <div
        className={`opacity-50 pointer-events-none absolute right-0 top-0 h-full w-4 bg-gradient-to-r to-white/75 dark:to-[#0F1829] dark:from-transparent from-transparent z-10`}
      ></div>
      {/* Dettagli annuncio */}
      <AnnuncioDetails
        annuncio={annuncio}
        updateMode={updateMode}
        views={views}
      />

      <div
        ref={ref}
        className={`p-4 space-y-5 w-full h-full absolute top-0 left-0 ${
          updateMode ? "translate-x-0 " : "translate-x-[200%] "
        } transition-all duration-500 ease-in-out`}
      >
        {/* Modifica annuncio */}
        {isVisible && (
          <AnnuncioUpdate
            annuncio={annuncio}
            setUpdateMode={setUpdateMode}
            aggiornaAnnuncio={(updated) => setAnnuncioState(updated)}
            setRoomsModalOpen={setRoomsModalOpen}
            roomsModalOpen={roomsModalOpen}
            apartmentModalOpen={apartmentModalOpen}
            setApartmentModalOpen={setApartmentModalOpen}
          />
        )}
      </div>
    </div>
  );
}
