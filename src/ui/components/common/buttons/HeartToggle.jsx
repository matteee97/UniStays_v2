import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";
import { useToggleLike } from "@/ui/hooks";

export default function HeartToggle({
  app,
  userID,
  apartmentId,
  liked = false,
  setLiked = () => {},
  position = "",
}) {
  const finalAppId = app?.id ?? apartmentId;
  const toggleLike = useToggleLike(userID, finalAppId, app?.title);

  const handleClick = async (e) => {
    e.stopPropagation();
    try {
      await toggleLike(liked, setLiked);
    } catch (error) {
      console.error("Like failed", error);
    }
  };

  return (
    <div className={position}>
      <div className="relative">
        {/* Cuore grande animato sotto */}
        {liked && (
          <div
            aria-hidden="true"
            className="absolute inset-0 -top-[0.8px] flex justify-center items-center pointer-events-none"
          >
            <FontAwesomeIcon
              icon={regularHeart}
              className="text-[#228e8c48] pop-glow"
              style={{ fontSize: "2.5rem" }}
              // animazione via classe CSS
            />
          </div>
        )}

        {/* Cuore cliccabile vero e proprio */}
        <button
          aria-pressed={liked}
          aria-label={liked ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
          onClick={handleClick}
          className={`w-5 h-5 mt-[4.5px] text-[#228E8D] cursor-pointer transition-transform duration-300 ease-in-out focus:outline-none  ${
            liked ? "pulse-heart" : ""
          }`}
          type="button"
        >
          <FontAwesomeIcon
            icon={liked ? solidHeart : regularHeart}
            className="w-5 h-5"
          />
        </button>

        <style>{`
          @keyframes popGlow {
            0% {
              transform: scale(0.4);
              opacity: 0;
              filter: drop-shadow(0 0 0 #228e8d);
            }
            50% {
              transform: scale(1.4);
              opacity: 1;
              filter: drop-shadow(0 0 8px #228e8d);
            }
            100% {
              transform: scale(1);
              opacity: 0;
              filter: drop-shadow(0 0 0 #228e8d);
            }
          }
          @keyframes pulseHeart {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.15);
            }
          }
          .pop-glow {
            animation: popGlow 0.6s forwards ease-out;
          }
          .pulse-heart {
            animation: pulseHeart 0.6s ease-in-out;
          }
        `}</style>
      </div>
    </div>
  );
}
