import { useMemo } from "react";
import { useNavigateToCity } from "@/ui/hooks";
import { FeaturedBadge } from "../badges/Badge";
import CardShell from "./CardShell";
import CardHighlights from "./CardHighlights";
import { getPriceRangeLabel } from "@/ui/helpers/apartmentPricing";
import { FALLBACK_IMAGE } from "@/ui/shared/constants";

const highlightData = (app) => [
  {
    label: "Città",
    value: app.address?.city ? app.address?.city : "—",
  },
  {
    label: "Superficie",
    value: app.features?.totalAreaMq ? `${app.features.totalAreaMq} m²` : "—",
  },
  {
    label: "Camere",
    value: app.aggregates?.totalRooms ?? "?",
  },
  {
    label: "Bagni",
    value: app.features?.bathroomsCount ?? "?",
  },
];

export default function FeaturedApartmentCard({ app }) {
  const goTo = useNavigateToCity();
  const highlights = useMemo(() => highlightData(app), [app]);
  const description =
    app.description ||
    `Alloggio premium a ${app.address?.city || "università"}.`;

  const handleClick = () => {
    const city = {
      city: app.address?.city,
      provinceCode: app.address?.provinceCode,
    };
    goTo(city, `/${app.id}`);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  const priceLabel = getPriceRangeLabel(app.aggregates);
  const imageSource =
    app.apartmentPhotoUrls?.[0] !== undefined &&
    app.apartmentPhotoUrls?.[0] !== ""
      ? app.apartmentPhotoUrls[0]
      : FALLBACK_IMAGE;

  return (
    <CardShell
      imageSlot={
        <div className="relative h-full w-full overflow-hidden rounded-2xl">
          {/* background blur */}
          <img
            src={imageSource}
            alt=""
            className="absolute inset-0 h-full w-full object-cover blur-3xl scale-150 dark:brightness-110"
          />

          {/* foreground */}
          <img
            src={imageSource}
            alt={`Immagine dell'alloggio ${app.title}`}
            className="
              absolute inset-0 m-auto
              max-h-full w-full object-contain
              brightness-105 contrast-105
              [mask-image:linear-gradient(to_bottom,transparent_0%,black_12%,black_68%,transparent_100%)]
              [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_2%,black_48%,transparent_100%)]
            "
          />
        </div>
      }
      alt={`Immagine dell'alloggio ${app.title}`}
      badge={app?.isFeatured ? <FeaturedBadge /> : null}
      topContent={
        <>
          <h3 className="text-2xl font-bold leading-tight">{app.title}</h3>
          <p className="text-sm text-white/70 line-clamp-2">{description}</p>
        </>
      }
      bottomContent={
        <>
          <CardHighlights items={highlights} className="mt-3" />
        </>
      }
      hoverContent={
        <>
          <div className="p-6 text-sm text-white/80">
            <p className="uppercase text-[10px] tracking-[0.3em] text-white/60 font-semibold">
              Dettagli Alloggio
            </p>
            <p className="mt-3 text-base whitespace-pre-line leading-relaxed max-h-[400px] overflow-y-auto">
              {description}
            </p>
          </div>
          <div className="flex items-center justify-between border-t border-white/10 px-6 py-4 text-xs uppercase tracking-[0.4em] text-white/80">
            <span className="text-white/70">Scorri per esplorare</span>
            <span className="font-semibold text-white">Vai</span>
          </div>
        </>
      }
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      widthClass="w-[310px] sm:w-[330px] md:w-[360px]"
      heightClass="h-[450px] sm:h-[520px]"
      ariaLabel={`Scopri di più su ${app.title}`}
      priceTag={priceLabel ? `${priceLabel}€/mese` : "Prezzo su richiesta"}
    />
  );
}
