import RibbonBadge from "../badges/RibbonBadge";
import { faCheck, faCity, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import { formatDate } from "@/ui/helpers/formatDate";

const HostCard = ({
  roleLabel = "Informazioni non presenti",
  photoUrl = "/img/logo.svg",
  img_profilo,
  displayName = "Informazioni non presenti",
  date,
  isVerified = false,
  userId,
  bgImg = true,
}) => {
  const resolvedPhoto = photoUrl || img_profilo || "/img/logo.svg";
  const formattedDate = formatDate(date, "it-IT", {
    year: "numeric",
    month: "long",
  });
  return (
    <Link
      to={userId ? `/host/${userId}` : "#"}
      className="relative z-0 p-2 bg-[#e0f5f4] dark:bg-[#131e32] rounded-[58px] w-full shadow-[0_15px_25px_rgba(0,0,0,0.2)] hover:shadow-[0_15px_28px_rgba(0,0,0,0.27)] transition-all duration-300"
    >
      <RibbonBadge
        text={roleLabel}
        icon={roleLabel === "Proprietario" ? faUser : faCity}
      />
      <div className="relative overflow-hidden rounded-[50px] border-[3.5px] p-0 border-[#228E8D]/20 dark:border-[#1F2937] shadow-md">
        {bgImg && (
          <img
            src={resolvedPhoto ?? "/img/logoFullColor.webp"}
            alt={displayName}
            className="absolute inset-0 object-cover -z-10 scale-110 opacity-100"
          />
        )}
        <div
          className={`bg-gradient-to-tr ${
            bgImg
              ? "from-[#ffffff]/50 dark:from-[#121c30f8] to-[#c3e9e7]/80 dark:to-[#0b1220a4]"
              : "from-[#ffffff] dark:from-[#121c30db] to-[#c3e9e7] dark:to-[#0b1220dd]"
          } backdrop-blur-xl px-10 py-8 w-full h-full space-y-6 z-0`}
        >
          <div className="flex flex-col items-start gap-3">
            <div className="relative">
              <img
                src={resolvedPhoto ?? "/img/logoFullColor.webp"}
                alt={displayName}
                className="w-24 h-24 rounded-full border-2 border-[#228E8D] object-cover shadow-lg"
              />
              {isVerified && (
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-[#d4f1ef] to-[#58c6c2] flex items-center justify-center border-2 border-[#228E8D] shadow-md">
                  <FontAwesomeIcon
                    icon={faCheck}
                    className="text-[#228E8D] h-5 w-5 drop-shadow-md"
                  />
                </div>
              )}
            </div>

            <h3 className="text-2xl text-[#228E8D] font-semibold line-clamp-2">
              {displayName}
            </h3>
          </div>

          {formattedDate === "Data non disponibile" ? null : (
            <p
              className={`text-sm ${bgImg ? "text-white/70" : "text-gray-400"}`}
            >
              {roleLabel} da{" "}
              <span className="font-medium">{formattedDate}</span>
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default HostCard;
