import {
  faMapMarkerAlt,
  faUniversity,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Badge } from "@/ui/components/common/badges";

export default function ApartmentsHeader({
  cityImage,
  cityName,
  universityName,
}) {
  return (
    <div className="fixed top-0 left-0 w-full h-[400px] object-cover z-[-1]">
      <img
        src={cityImage}
        alt={cityName}
        loading="eager"
        width="1920"
        height="400"
        className="w-full h-full 2xl:h-screen blur-sm object-cover scale-105"
      />
      <div className="absolute 2xl:h-screen inset-0 bg-black bg-opacity-30 dark:bg-opacity-55"></div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 ">
        {/* City Badge */}
        <Badge variant="info" icon="position">
          <span>{cityName}</span>
        </Badge>

        {/* Main Title */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl text-white/70 font-bold mb-6 leading-tight">
          Alloggi a{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#228E8D] to-[#196865]">
            {cityName}
          </span>
        </h1>

        {/* University Info */}
        {universityName && (
          <div className="flex items-center justify-center gap-3 text-lg md:text-xl mb-16 opacity-90">
            <FontAwesomeIcon icon={faUniversity} className="text-[#228E8D]" />
            <span className="text-white/80">{universityName}</span>
          </div>
        )}
      </div>
    </div>
  );
}
