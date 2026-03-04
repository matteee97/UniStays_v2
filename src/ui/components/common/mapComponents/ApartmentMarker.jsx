import { OverlayView } from "@react-google-maps/api";
import React from "react";
import { getPriceRangeLabel } from "@/ui/helpers/apartmentPricing";

const ApartmentMarker = React.memo(
  function ApartmentMarker({ app, onClick, hoveredApartmentId }) {
    const isHovered = app.id === hoveredApartmentId;
    const priceLabel = getPriceRangeLabel(app.aggregates, true);

    return (
      <OverlayView
        position={{
          lat: app.address.location._lat,
          lng: app.address.location._long,
        }}
        mapPaneName={
          isHovered ? OverlayView.FLOAT_PANE : OverlayView.OVERLAY_MOUSE_TARGET
        }
      >
        <div
          className={`bg-[#228E8D] text-white w-16 h-7 flex items-center justify-center font-bold text-sm py-2 rounded-full shadow-md dark:shadow-lg cursor-pointer hover:scale-110 hover:opacity-100 duration-300 ${
            isHovered ? " scale-125 opacity-100 " : "opacity-80"
          }`}
          style={{}}
          onClick={(e) => {
            onClick(app);
            e.stopPropagation();
          }}
        >
          {priceLabel || "—"}
        </div>
      </OverlayView>
    );
  },
  (prevProps, nextProps) =>
    prevProps.app.id === nextProps.app.id &&
    prevProps.hoveredApartmentId === nextProps.hoveredApartmentId,
);

export default ApartmentMarker;
