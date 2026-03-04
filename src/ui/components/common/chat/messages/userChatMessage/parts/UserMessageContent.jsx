import UserBookingPreviewCard from "./UserBookingPreviewCard";

const BOOKING_TEXT_CLASS = "dark:text-white/80";

const UserMessageContent = ({
  message,
  isEmojiOnlyMessage,
  isBookingPreview,
  bookingDetails,
  isMyMessage,
}) => {
  const contentClassName = isEmojiOnlyMessage
    ? "text-[40px] leading-none whitespace-pre-wrap"
    : isBookingPreview
      ? `text-sm whitespace-pre-wrap break-words mb-2 mt-2 ${BOOKING_TEXT_CLASS}`
      : "text-sm whitespace-pre-wrap break-words";

  const editedLabelClass = isEmojiOnlyMessage
    ? `text-[10px] mt-2 italic ${
        isMyMessage ? "text-white/70" : "text-gray-600"
      }`
    : "text-xs opacity-75 mt-1 italic";

  return (
    <div className={`${isEmojiOnlyMessage ? "text-center" : ""} flex flex-col`}>
      <div className={contentClassName}>
        {isBookingPreview && bookingDetails && (
          <div className="flex flex-col gap-3 mb-3">
            <UserBookingPreviewCard
              title={bookingDetails.title}
              date={bookingDetails.date}
              roomsRequested={bookingDetails.roomsRequested}
              roomLabel={bookingDetails.roomLabel}
              reason={bookingDetails.reason}
              isMyMessage={isMyMessage}
            />
          </div>
        )}
        {message.content}
      </div>

      {message.isEdited && <p className={editedLabelClass}>(modificato)</p>}
    </div>
  );
};

export default UserMessageContent;
