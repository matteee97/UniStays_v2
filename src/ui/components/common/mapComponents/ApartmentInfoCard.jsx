import { OverlayView } from "@react-google-maps/api";
import React from "react";
import InMapApartmentsCard from "../cards/InMapApartamentsCard";

const ApartmentInfoCard = React.memo(function ApartmentInfoCard({
  apartment,
  onClose,
  liked,
}) {
  return (
    <OverlayView
      position={{
        lat: apartment.address.location._lat,
        lng: apartment.address.location._long,
      }}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
      <div className="translate-y-10">
        <InMapApartmentsCard
          liked={liked}
          selectedApartment={apartment}
          setSelectedApartment={onClose}
        />
      </div>
    </OverlayView>
  );
});

export default ApartmentInfoCard;
