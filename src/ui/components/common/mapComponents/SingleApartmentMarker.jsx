import { OverlayView } from "@react-google-maps/api";
import React from "react";
import HomeIcon from "../shared/icons/HomeIcon";

const SingleApartmentMarker = React.memo(function SingleApartmentMarker({
  app,
}) {
  return (
    <OverlayView
      position={{
        lat: app.address.location._lat,
        lng: app.address.location._long,
      }}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
      <div
        className={`relative bg-[#228E8D] text-white w-9 h-9 flex items-center justify-center font-bold text-sm py-2 rounded-full shadow-md z-20
        }`}
      >
        <div className="absolute -top-[1px] -left-1 rotate-45 w-5 h-4 bg-[#228E8D] rounded-full z-[-1]"></div>
        <HomeIcon className={"w-6 h-6"} />
      </div>
    </OverlayView>
  );
});

export default SingleApartmentMarker;
