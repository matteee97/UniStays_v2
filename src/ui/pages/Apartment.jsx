import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { toast } from "sonner";

import EmptyResults from "@/ui/components/common/messages/EmptyResults";
import BookingForm from "@/ui/components/common/form/BookingForm";
import {
  useFetchApartment,
  useSocialLinks,
  useWindowWidth,
  useFetchRecensioni,
  useInView,
} from "@/ui/hooks";
import MetaManager from "@/ui/components/common/seo/MetaManager";
import GreenDivider from "@/ui/components/common/dividers/GreenDivider";
import {
  ApartmentHeader,
  ApartmentHero,
  ApartmentInfo,
  ImageGallery,
  OwnerInfoSection,
  ApartmentFeedbackSection,
  ApartmentExtraFeatures,
} from "@/ui/components/sections/apartmentSection";
import { useNavigate } from "react-router-dom";
import { isValidFirestoreId } from "@/ui/helpers/validation";
import { formatDate } from "@/ui/helpers/formatDate";
import { createBookingKey, encodeChatPayload } from "@/ui/helpers/chatPayload";
import { USER_ROLES } from "@/shared/types";
export default function ApartmentPage() {
  const { apartmentId } = useParams();
  const { user } = useUser();
  const userID = user?.id;
  const [startDate, setStartDate] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  const navigationLinks = useMemo(
    () => [
      { id: "section-foto", label: "Foto" },
      { id: "section-caratteristiche", label: "Caratteristiche" },
      { id: "section-stanze", label: "Stanze" },
      { id: "section-posizione", label: "Posizione" },
    ],
    [],
  );

  const navigate = useNavigate();
  const width = useWindowWidth();
  const [ref, isVisible] = useInView({ threshold: 0.05 });

  const pdfRef = useRef(null);
  const sanitizedApartmentId = useMemo(
    () => (isValidFirestoreId(apartmentId) ? apartmentId : null),
    [apartmentId],
  );
  const invalidApartmentId = Boolean(apartmentId && !sanitizedApartmentId);

  const { app, liked, setLiked } = useFetchApartment(
    sanitizedApartmentId,
    userID,
  );
  const owner = app?.owner || app?.ownerSnapshot || null;
  const ownerId = owner?.ownerId || null;
  const rooms = app?.rooms || [];
  const ROOM_TYPE_LABELS = {
    single: "Singola",
    double: "Doppia",
    entire_apartment: "Intero appartamento",
  };
  const getRoomKey = useCallback(
    (room, index) => room?.roomId || room?.id || `room-${index}`,
    [],
  );
  // Fetch recensioni usando l'hook personalizzato
  const { recensioni, loading } = useFetchRecensioni(app?.id, true); //TODO: logica lazy loading

  // Calcola statistiche
  const stats = useMemo(() => {
    if (!recensioni.length) return null;

    const total = recensioni.length;
    const average =
      recensioni.reduce((acc, rev) => acc + rev.rating, 0) / total;
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    recensioni.forEach((rev) => {
      distribution[Math.round(rev.rating)] =
        (distribution[Math.round(rev.rating)] || 0) + 1;
    });

    return {
      total,
      average: average.toFixed(1),
      distribution,
      percentage: ((average / 5) * 100).toFixed(0),
    };
  }, [recensioni]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, []);

  useEffect(() => {
    if (invalidApartmentId) {
      toast.error("ID annuncio non valido.");
    }
  }, [invalidApartmentId]);

  const socialLinks = useSocialLinks("Guarda questo annuncio!");
  useEffect(() => {
    if (!rooms.length) {
      if (selectedRoomId) setSelectedRoomId(null);
      return;
    }
    if (rooms.length === 1) {
      setSelectedRoomId(getRoomKey(rooms[0], 0));
      return;
    }
    const hasSelection = rooms.some(
      (room, index) => getRoomKey(room, index) === selectedRoomId,
    );
    if (!hasSelection && selectedRoomId) {
      setSelectedRoomId(null);
    }
  }, [rooms, selectedRoomId, getRoomKey]);

  const selectedRoomInfo = useMemo(() => {
    if (!rooms.length) return null;
    const selectionKey =
      selectedRoomId || (rooms.length === 1 ? getRoomKey(rooms[0], 0) : null);
    if (!selectionKey) return null;
    const index = rooms.findIndex(
      (room, idx) => getRoomKey(room, idx) === selectionKey,
    );
    if (index === -1) return null;
    const room = rooms[index];
    const mappedTypeLabel = ROOM_TYPE_LABELS[room?.type] || "";
    const suffix = mappedTypeLabel ? ` (${mappedTypeLabel})` : "";
    return {
      room,
      index,
      label: `Stanza ${index + 1}${suffix}`,
      image: room?.photoUrls?.[0] || null,
      typeLabel: mappedTypeLabel || "Tipologia non specificata",
      key: getRoomKey(room, index),
    };
  }, [rooms, selectedRoomId, getRoomKey]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (userID === ownerId) {
      toast.error("Non puoi contattare te stesso");
      return;
    }
    if (!startDate) return toast.warning("Seleziona una data");

    if (rooms.length > 1 && !selectedRoomInfo) {
      toast.error("Seleziona una stanza");
      return;
    }

    if (!user) {
      toast.error("Devi essere loggato per contattare l'" + USER_ROLES.HOST);
      return;
    }

    if (!ownerId) {
      toast.error(`${USER_ROLES.HOST} non disponibile`);
      return;
    }

    // Crea messaggio iniziale
    const dateStr = formatDate(startDate, "it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const roomLabel = selectedRoomInfo?.label || "una stanza";
    const reason = `Richiesta di prenotazione per ${roomLabel} a partire dal ${dateStr}`;
    const message = `Buongiorno, sono interessato alla ${roomLabel} del suo appartamento "${app.title}", \nPotrebbe fornirmi maggiori informazioni sulla disponibilità? `;
    const payload = {
      type: "booking-preview",
      content: message,
      meta: {
        title: app.title || null,
        date: dateStr,
        roomId: selectedRoomInfo?.key || null,
        roomLabel: selectedRoomInfo?.label || null,
        roomType: selectedRoomInfo?.typeLabel || null,
        roomPriceMonthly: selectedRoomInfo?.room?.priceMonthly ?? null,
        reason,
        source: "booking-form",
        previewImage:
          selectedRoomInfo?.image || app.apartmentPhotoUrls?.[0] || null,
        bookingKey: createBookingKey({
          userId: userID,
          hostId: ownerId,
          apartmentId,
          meta: { date: dateStr, roomId: selectedRoomInfo?.key || "" },
        }),
      },
    };
    const encodedPayload = encodeChatPayload(payload);

    if (!encodedPayload) {
      toast.error("Errore nella creazione del messaggio");
      return;
    }

    // Reindirizza alla pagina chat con i parametri dell'host e messaggio
    navigate(
      `/chat?hostId=${ownerId}&apartmentId=${apartmentId}&payload=${encodeURIComponent(
        encodedPayload,
      )}`,
    );
  };

  const apartmentImages = useMemo(() => app?.apartmentPhotoUrls || [], [app]);
  const images = useMemo(() => {
    const roomImages = rooms.flatMap((room) => room.photoUrls || []);
    return [...apartmentImages, ...roomImages];
  }, [apartmentImages, rooms]);
  const scrollToSection = (targetId) => {
    const el = document.getElementById(targetId);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "smooth" });
  };

  if (invalidApartmentId) {
    return (
      <>
        <MetaManager
          title="Annuncio non valido"
          description="L'ID dell'annuncio non è valido."
        />
        <EmptyResults />
      </>
    );
  }

  return (
    <>
      {app && (
        <MetaManager
          title={app.title}
          description={app.description}
          image={app.apartmentPhotoUrls?.[0]}
          url={`/annuncio/${apartmentId}`}
        />
      )}

      {app === null ? (
        <EmptyResults />
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-[#F0FAF9] via-white to-[#F0FAF9] dark:from-[#0F172A] dark:via-[#0F172A] dark:to-[#0F172A]">
          {/* Header Section */}
          <ApartmentHeader
            app={app}
            userID={userID}
            apartmentId={apartmentId}
            liked={liked}
            setLiked={setLiked}
            socialLinks={socialLinks}
          />
          <div className="relative max-w-[1340px] 2xl:max-w-[1500px] mx-auto">
            <div className="px-4 py-2 sm:py-8">
              <div ref={pdfRef} id="section-foto">
                {/* Hero Section */}
                <ApartmentHero
                  app={app}
                  averageRating={app?.metrics?.ratingAvg ?? null}
                />

                {/* Image Gallery */}
                <ImageGallery
                  images={images}
                  apartmentImages={apartmentImages}
                  rooms={rooms}
                />
              </div>

              {/* Description and booking */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10 ">
                {/* Left section - Info */}
                <div className="lg:col-span-2 space-y-8 ">
                  <ApartmentInfo app={app} />

                  <GreenDivider />
                </div>

                {/* Right section - Booking */}
                <div className="lg:col-span-1">
                  <div className="sticky top-24 space-y-6">
                    {width > 1024 ? (
                      <BookingForm
                        handleSubmit={handleSubmit}
                        rooms={rooms}
                        selectedRoomId={selectedRoomId}
                        onRoomSelect={setSelectedRoomId}
                        startDate={startDate}
                        isAgency={
                          owner?.isAgency || owner?.roleBadge === "agency"
                        }
                        setStartDate={setStartDate}
                        apartmentId={apartmentId}
                        ownerId={ownerId}
                        ref={ref}
                        version="form"
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
            <div className=" sm:px-2 ">
              <OwnerInfoSection owner={owner} />

              {/* Feedback Section */}
              <ApartmentFeedbackSection
                app={app}
                reviews={recensioni}
                stats={stats}
                loading={loading}
                containerClassName="my-6"
              />

              {/* Extra Features */}
              <ApartmentExtraFeatures
                app={app}
                userID={userID}
                apartmentId={apartmentId}
                liked={liked}
                setLiked={setLiked}
                pdfRef={pdfRef}
                socialLinks={socialLinks}
              />
            </div>
          </div>

          {/* Mobile Booking button version */}

          <BookingForm
            handleSubmit={handleSubmit}
            rooms={rooms}
            selectedRoomId={selectedRoomId}
            onRoomSelect={setSelectedRoomId}
            startDate={startDate}
            isAgency={owner?.isAgency || owner?.roleBadge === "agency"}
            setStartDate={setStartDate}
            apartmentId={apartmentId}
            ownerId={ownerId}
            version="button"
            navigationLinks={navigationLinks}
            onNavigate={scrollToSection}
            containerClassName={`${
              width <= 1024 || !isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            } transition-all duration-500`}
          />
        </div>
      )}
    </>
  );
}
