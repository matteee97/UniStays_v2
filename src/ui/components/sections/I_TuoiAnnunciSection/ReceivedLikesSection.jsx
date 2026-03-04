import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faComments,
  faHeart,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import { formatDate } from "@/ui/helpers/formatDate";
import { CoolButton } from "../../common";
import { useNavigate } from "react-router-dom";
import { encodeChatPayload } from "@/ui/helpers/chatPayload";

const LIKE_DATE_TIME_FORMAT = {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

const getDisplayName = (like) => {
  const name = like?.likedByDisplayName;
  return typeof name === "string" && name.trim() ? name.trim() : "Utente";
};

const getInitial = (value) => {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized ? normalized.charAt(0).toUpperCase() : "U";
};

const formatLikeDate = (likedAt) => {
  if (!likedAt) return "Data non disponibile";
  return formatDate(likedAt, "it-IT", LIKE_DATE_TIME_FORMAT);
};

const buildLikeMessage = ({ apartmentTitle, likerName }) =>
  `Ciao ${likerName}! Ho visto il tuo like al mio annuncio "${apartmentTitle}". Se vuoi, posso condividerti tutti i dettagli e organizzare una visita.`;

export default function ReceivedLikesSection({
  likes = [],
  isLoading = false,
  error = null,
}) {
  const normalizedLikes = Array.isArray(likes) ? likes.filter(Boolean) : [];
  const navigate = useNavigate();

  return (
    <section className="bg-white border-2 border-[#d4f1ef] rounded-2xl p-4 sm:p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faHeart} className="text-[#228E8D]" />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-700">
            Like ricevuti
          </h2>
        </div>
        <span className="text-sm font-medium text-gray-500">
          {normalizedLikes.length} like
        </span>
      </div>

      {error && (
        <p className="text-sm text-red-500">
          Errore nel caricamento dei like ricevuti: {error}
        </p>
      )}

      {!error && isLoading && normalizedLikes.length === 0 && (
        <p className="text-sm text-gray-500">Caricamento like ricevuti...</p>
      )}

      {!error && !isLoading && normalizedLikes.length === 0 && (
        <p className="text-sm text-gray-500">
          Qui vedrai chi mette like ai tuoi annunci e quando succede.
        </p>
      )}

      {!error && normalizedLikes.length > 0 && (
        <ul className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {normalizedLikes.map((like) => {
            const displayName = getDisplayName(like);
            const apartmentTitle = like?.apartmentTitle || "Annuncio";
            const participantId = like?.likedByUserId || null;
            const apartmentId = like?.apartmentId || null;
            const payload = encodeChatPayload({
              type: "like-received",
              content: buildLikeMessage({
                apartmentTitle,
                likerName: displayName,
              }),
              meta: {
                source: "received-likes-dashboard",
                likedByUserId: participantId,
                apartmentId,
              },
            });
            const canOpenChat = Boolean(
              participantId && apartmentId && payload,
            );

            return (
              <li
                key={like?.id || `${like?.apartmentId}-${like?.likedByUserId}`}
                className="flex flex-col sm:flex-row w-full sm:items-center gap-6 sm:gap-2 rounded-xl border border-[#d4f1ef] bg-[#f0fafa] p-3"
              >
                <div className="flex w-full items-start gap-3">
                  <div className="shrink-0">
                    {like?.likedByPhotoUrl ? (
                      <img
                        src={like.likedByPhotoUrl}
                        alt={`Foto profilo di ${displayName}`}
                        className="w-10 h-10 rounded-full object-cover border border-[#d4f1ef]"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#e7f6f6] text-[#228E8D] flex items-center justify-center font-semibold border border-[#d4f1ef]">
                        {getInitial(displayName)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <span className="font-semibold">{displayName}</span> ha
                      messo like a{" "}
                      <span className="font-semibold">"{apartmentTitle}"</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <FontAwesomeIcon
                          icon={faClock}
                          className="text-[#228E8D]"
                        />
                        {formatLikeDate(like?.likedAt)}
                      </span>
                      {like?.apartmentCity && (
                        <span className="inline-flex items-center gap-1">
                          <FontAwesomeIcon
                            icon={faLocationDot}
                            className="text-[#228E8D]"
                          />
                          {like.apartmentCity}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <CoolButton
                  type="button"
                  disabled={!canOpenChat}
                  ariaLabel={`Apri chat con ${displayName}`}
                  onClick={() => {
                    if (!canOpenChat) return;

                    const queryParams = new URLSearchParams({
                      hostId: participantId,
                      apartmentId,
                      payload,
                    });
                    navigate(`/chat?${queryParams.toString()}`);
                  }}
                  className="max-w-40 !py-1.5 !px-2 text-xs sm:text-sm"
                >
                  <FontAwesomeIcon icon={faComments} className="mr-1" />
                  Contatta
                </CoolButton>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
