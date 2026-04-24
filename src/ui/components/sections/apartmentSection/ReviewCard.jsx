import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faThumbsUp,
  faReply,
  faFlag,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { renderStars } from "@/ui/helpers/renderStars.jsx";
import { formatDate } from "@/ui/helpers/formatDate";
import ReplyForm from "./ReplyForm";
import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import ReportModal from "@/ui/components/common/reports/ReportModal";
import AvatarWithFallback from "@/ui/components/common/avatars/AvatarWithFallback";

/**
 * Componente per la singola recensione
 * @param {Object} review - Dati della recensione
 * @returns {JSX.Element} Card della recensione
 */
export default function ReviewCard({
  review,
  onToggleLike,
  onReply,
  mode = "apartment",
}) {
  const [open, setOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const { user } = useUser();
  const currentUserId = user?.id;
  const isLiked = (review?.likedBy || []).includes(currentUserId);
  const reply = review?.latestReply;
  const reportTarget =
    review?.id && review?.apartmentId
      ? {
          type: "review",
          id: review.id,
          reviewId: review.id,
          apartmentId: review.apartmentId,
          userId: review.authorId,
        }
      : null;
  const canReport = Boolean(reportTarget);

  return (
    <div className="p-6 ">
      {/* Review Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <AvatarWithFallback
            avatarUrl={review.authorPhotoUrl || ""}
            name={review.authorName || "Studente"}
            alt={review.authorName || "Utente"}
            className="w-10 h-10 rounded-full border-2 border-[#228E8D]"
            initialsClassName="text-sm"
            imageClassName="rounded-full"
          />
          <div>
            <div className="font-medium text-gray-800">
              {review.authorName || "Studente"}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3" />
              {formatDate(review.createdAt)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {renderStars(review.rating)}
        </div>
      </div>

      {/* Review Content */}
      <div className="mb-4">
        <p className="text-gray-700 leading-relaxed">{review.text}</p>
      </div>

      {/* Review Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={mode === "apartment" ? () => onToggleLike?.(review) : null}
            className={`flex items-center gap-2 text-sm transition-colors ${
              mode === "apartment"
                ? `cursor-pointer hover:text-[#228E8D] ${
                    isLiked ? "text-[#228E8D]" : "text-gray-500"
                  }`
                : "cursor-default text-gray-500"
            }`}
            aria-label="Metti like"
          >
            <FontAwesomeIcon icon={faThumbsUp} className="w-4 h-4" />
            <span>{review.helpfulCount || 0}</span>
          </button>
          {mode === "apartment" && (
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#228E8D] transition-colors"
              aria-label="Rispondi"
            >
              <FontAwesomeIcon icon={faReply} className="w-4 h-4" />
            </button>
          )}
          {canReport && (
            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors"
              aria-label="Segnala recensione"
            >
              <FontAwesomeIcon icon={faFlag} className="w-4 h-4" />
            </button>
          )}
        </div>

        {reply?.isOwner && (
          <span className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-[#228E8D]">
            <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4" />
            <span>Risposta del proprietario</span>
          </span>
        )}
      </div>

      {/* Owner Reply */}
      {reply ? (
        <div
          className={`mt-4 p-4 rounded-lg border-l-4 ${
            reply?.isOwner
              ? "border-[#228E8D] bg-[#f0fafa]"
              : "border-[#228E8D]/70 bg-gray-50"
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <AvatarWithFallback
                avatarUrl={reply?.authorPhotoUrl || ""}
                name={reply?.authorName || (reply?.isOwner ? "Host" : "Utente")}
                alt={reply?.authorName || "Utente"}
                className="w-6 h-6 rounded-full border border-[#228E8D]"
                initialsClassName="text-[10px]"
                imageClassName="rounded-full"
              />
              <span className="font-medium text-[#228E8D]">
                {reply?.authorName || (reply?.isOwner ? "Host" : "Utente")}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3 mr-1" />
              {formatDate(reply?.createdAt)}
            </span>
          </div>
          <p className="text-gray-700 text-sm">
            {reply?.text}
          </p>
        </div>
      ) : open ? (
        <div className="mt-2">
          <ReplyForm
            onSubmit={(text) => onReply?.(review.id, text)}
            setOpen={setOpen}
          />
        </div>
      ) : null}

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        target={reportTarget}
        targetLabel="recensione"
        title="Segnala recensione"
      />
    </div>
  );
}
