import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuoteLeft } from "@fortawesome/free-solid-svg-icons";

export default function HostBio({ host }) {
  if (!host?.bio) return null;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 sm:p-6 border border-[#d4f1ef] shadow-md mx-2 sm:mx-4">
      <div className="flex items-start gap-2 sm:gap-4 divide-x-[1px] sm:divide-x-2 divide-[#228E8D]/10">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-[#228E8D]/10 rounded-full flex items-center justify-center">
            <FontAwesomeIcon
              icon={faQuoteLeft}
              className="text-[#228E8D]/60  w-3 h-3 sm:w-6 sm:h-6"
            />
          </div>
        </div>
        <div className="flex-1">
          <div className="relative pl-2 sm:pl-4">
            <h3 className="text-lg font-semibold text-[#228E8D] mb-3">
              Chi sono
            </h3>
            <p className="text-gray-600 leading-relaxed pl-3 sm:pl-4">
              {host.bio}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
