import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { Breadcrumb } from "@/ui/components/common";
import HeartToggle from "@/ui/components/common/buttons/HeartToggle";
import SocialShare from "./SocialShare";
import { useLocation, useNavigate } from "react-router-dom";

const buildListingSearch = (search) => {
  const params = new URLSearchParams(search);
  params.delete("roomId");

  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
};

const getListingSearchSource = (location) => {
  const sourceSearch = location.state?.listingSearch;
  return typeof sourceSearch === "string" && sourceSearch !== "?"
    ? sourceSearch
    : location.search;
};

export default function ApartmentHeader({
  app,
  userID,
  apartmentId,
  liked,
  setLiked,
  socialLinks,
}) {
  const location = useLocation();
  const canGoBack = location.state?.fromInternal;
  const navigate = useNavigate();
  const citySlug = encodeURIComponent(
    [app?.address?.city, app?.address?.provinceCode].filter(Boolean).join("-"),
  );
  const citySearch = buildListingSearch(getListingSearchSource(location));
  const cityPath = `/alloggi/${citySlug}${citySearch}`;

  return (
    <div className="bg-white border-b border-[#d4f1ef]">
      <div className="max-w-[2000px] mx-auto px-4 py-4">
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            {canGoBack && (
              <button
                type="button"
                aria-label="Torna indietro"
                className="bg-[#228E8D] text-white py-3 px-2 rounded-full hover:bg-[#227d7a] transition-all duration-300 hover:scale-105 "
                onClick={() => navigate(-1)}
              >
                <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
              </button>
            )}

            <div className="hidden sm:block">
              <Breadcrumb
                crumbs={[
                  { label: "Alloggi", to: "/" },
                  {
                    label: app?.address?.city || "Città",
                    to: cityPath,
                  },
                  { label: "Dettagli" },
                ]}
                className="!block"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <HeartToggle
              app={app}
              userID={userID}
              apartmentId={apartmentId}
              liked={liked}
              setLiked={setLiked}
            />
            <SocialShare socialLinks={socialLinks} />
          </div>
        </div>
      </div>
    </div>
  );
}
