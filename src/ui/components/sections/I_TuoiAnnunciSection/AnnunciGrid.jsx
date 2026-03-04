import React, { useEffect, useState } from "react";
import AnnuncioCard from "@/ui/components/common/cards/annuncioCard/AnnuncioCard";
import { useAppartamentiContext } from "@/ui/pages/I_TuoiAnnunci";
import { useScroll } from "@/ui/hooks";
import OneTimeMessage from "@/ui/components/common/messages/OneTimeMessage";

const ITuoiAnnunciPage = () => {
  const { filteredAppartamenti, allLoaded, loadMore } =
    useAppartamentiContext();
  const [annunci, setAnnunci] = useState([]);

  const { scrollRef } = useScroll(allLoaded, loadMore, 150, "vertical");

  useEffect(() => {
    setAnnunci(filteredAppartamenti);
  }, [filteredAppartamenti]);

  const handleDeleteAnnuncio = (id) => {
    setAnnunci((prev) =>
      prev.map((annuncio) =>
        annuncio.id === id ? { ...annuncio, isRemoving: true } : annuncio,
      ),
    );

    setTimeout(() => {
      setAnnunci((prev) => prev.filter((annuncio) => annuncio.id !== id));
    }, 700);
  };

  return (
    <div ref={scrollRef} className="w-full overflow-y-auto">
      <OneTimeMessage
        localStorageKey={"HowToUsePdfGeneratorMessage"}
        title={"Suggerimento"}
        message={
          "Premendo il tasto genera PDF otterrai un cartello di AFFITTASI in formato A4 pronto per la stampa, con tutte le informazioni principali del tuo alloggio. Scaricalo subito e preparati a conoscere i tuoi futuri inquilini!"
        }
      />

      <div className="space-y-6 w-full max-w-[2000px] mx-auto">
        <div className="grid grid-cols-1 gap-6 w-full">
          {annunci.map((annuncio) => (
            <div key={annuncio.id}>
              <AnnuncioCard
                annuncio={annuncio}
                onDeleteAnnuncio={handleDeleteAnnuncio}
              />
              <div className="h-[2px] w-full bg-[#d4f1ef] mt-6 shadow-sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ITuoiAnnunciPage;
