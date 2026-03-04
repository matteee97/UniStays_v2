import { forwardRef } from "react";
import {
  faBath,
  faBed,
  faHouse,
  faWifi3,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { QRCodeSVG } from "qrcode.react";

export const PdfDoc = forwardRef(({ app }, ref) => {
  const city = app?.address?.city || "";
  const provinceCode = app?.address?.provinceCode || "";
  const citySlug = `${city}${provinceCode ? `-${provinceCode}` : ""}`
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/-{2,}/g, "-")
    .replace(/(^-|-$)/g, "");
  return (
    <div
      ref={ref}
      style={{
        width: "264.66px",
        height: "374.33px",
        padding: "6.66px",
        fontSize: "6.66px",
        backgroundColor: "#fff",
      }}
      className="border-[2.66px] border-[#228E8D] rounded-lg overflow-hidden"
    >
      <header className="flex justify-center items-center pb-4 border-b-[1.33px] border-[#d4f1ef]">
        <img
          src="/img/ExtendedLogo.svg"
          alt={app?.title}
          className="w-[166.66px] object-cover"
        />
      </header>

      <div className="space-y-[26.66px] mt-4.5">
        <div className="text-center text-[#228E8D]">
          <h1 className="text-[16px] font-bold mt-3">AFFITTASI</h1>
          <h2 className="text-[10.66px] font-semibold mt-1 text-[#2d2d2d] line-clamp-2 pb-[3.33px]">
            {app?.title}
          </h2>
        </div>

        <div
          className={`grid ${
            app.amenities?.wifi ? "grid-cols-4" : "grid-cols-3"
          } gap-[1.33px] mx-auto mt-[5.33px] font-medium text-[#2d2d2d] text-[6.66px]`}
        >
          <p className="flex justify-center items-center gap-1">
            <FontAwesomeIcon icon={faHouse} className="text-[#228E8D]" />
            {app.features?.totalAreaMq} m²
          </p>
          <p className="flex justify-center items-center gap-1">
            <FontAwesomeIcon icon={faBed} className="text-[#228E8D]" />
            {app.aggregates?.totalRooms} camer
            {app.aggregates?.totalRooms > 1 ? "e" : "a"}
          </p>
          <p className="flex justify-center items-center gap-1">
            <FontAwesomeIcon icon={faBath} className="text-[#228E8D]" />
            {app.features?.bathroomsCount} bagn
            {app.features?.bathroomsCount > 1 ? "i" : "o"}
          </p>
          {app.amenities?.wifi && (
            <p className="flex justify-center items-center gap-1">
              <FontAwesomeIcon icon={faWifi3} className="text-[#228E8D]" />
              Wi-Fi
            </p>
          )}
        </div>

        <div className="flex justify-center items-center gap-1 mt-3.33">
          <p className="flex justify-center items-center gap-1 text-[#2d2d2d] font-semibold border-b pb-1 border-[#228E8D] text-[6.33px] text-center leading-tight">
            Scannerizza il Qr code per vedere il dettaglio dell'alloggio online:
          </p>
        </div>

        <div className="border-[2.66px] border-[#228E8D] w-fit mx-auto p-[5px] rounded-md">
          <QRCodeSVG
            value={`https://${window.location.hostname}/alloggi/${citySlug}/${app?.id}`}
            width={100} // 150 / 1.5
            height={100}
          />
        </div>
      </div>
    </div>
  );
});
