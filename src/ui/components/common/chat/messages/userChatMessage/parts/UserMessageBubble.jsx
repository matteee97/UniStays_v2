import UserMessageEditor from "./UserMessageEditor";
import UserMessageContent from "./UserMessageContent";
import { ImageWithSkeleton } from "@/ui/components/common";
import { useState } from "react";
import LightBoxImage from "@/ui/components/common/lightbox/LightBoxImage";

const getMyMessageBubbleClass = (isFirstInGroup, isLastInGroup) => {
  if (isFirstInGroup) {
    return "bg-gradient-to-b from-[#3aa49b] dark:from-[#1A6B6A] to-[#228E8D] dark:to-[#295857] text-white rounded-br-md";
  }
  if (isLastInGroup) {
    return "bg-gradient-to-t from-[#3aa49b] dark:from-[#295857] to-[#228E8D] dark:to-[#1A6B6A] text-white rounded-tr-md";
  }
  return "bg-[#228E8D] dark:bg-[#295857] text-white rounded-r-md";
};

const getOtherMessageBubbleClass = (isFirstInGroup, isLastInGroup) => {
  if (isFirstInGroup) {
    return "bg-gradient-to-b from-[#d8f1f0] to-[#b9e3df] dark:from-[#1c363a] dark:to-[#25464c86] text-gray-900 rounded-bl-md";
  }
  if (isLastInGroup) {
    return "bg-gradient-to-t from-[#d8f1f0] to-[#b9e3df] dark:from-[#25464c86] dark:to-[#1c363a] text-gray-900 rounded-tl-md";
  }
  return "bg-[#b9e3df] dark:bg-[#25464c86] text-gray-900 rounded-l-md";
};

const getBubbleClassName = ({
  isEmojiOnlyMessage,
  isMyMessage,
  isFirstInGroup,
  isLastInGroup,
  isEdited,
}) => {
  const bubbleClass = isEmojiOnlyMessage
    ? "py-2"
    : `px-3 sm:px-4 py-1 sm:py-2 rounded-3xl ${
        isMyMessage
          ? getMyMessageBubbleClass(isFirstInGroup, isLastInGroup)
          : getOtherMessageBubbleClass(isFirstInGroup, isLastInGroup)
      }`;

  return `${bubbleClass} ${isEdited ? "opacity-90" : ""}`;
};

const getBgClassName = (isMyMessage) => {
  return isMyMessage
    ? "bg-gradient-to-b from-[#3aa49b] dark:from-[#1A6B6A] to-[#228E8D] dark:to-[#295857]"
    : "bg-gradient-to-b from-[#d8f1f0] to-[#b9e3df] dark:from-[#1c363a] dark:to-[#25464c86]";
};

const UserMessageBubble = ({
  message,
  isEmojiOnlyMessage,
  isBookingPreview,
  bookingDetails,
  previewImage,
  isMyMessage,
  isFirstInGroup,
  isLastInGroup,
  isEditing,
  editContent,
  onEditChange,
  onEditSave,
  onEditCancel,
  onEditKeyDown,
}) => {
  const bubbleClassName = getBubbleClassName({
    isEmojiOnlyMessage,
    isMyMessage,
    isFirstInGroup,
    isLastInGroup,
    isEdited: message.isEdited,
  });

  const [imgExpanded, setImgExpanded] = useState(false);

  return (
    <>
      {previewImage && (
        <div
          className={`flex w-full justify-center p-1 my-1 rounded-3xl overflow-hidden ${getBgClassName(isMyMessage)}`}
        >
          <ImageWithSkeleton
            src={previewImage}
            alt="preview appartamento"
            rounded="rounded-[20px]"
            containerClassName="overflow-hidden"
            onClick={() => setImgExpanded(true)}
            imgClassName="w-full min-h-[148px] cursor-pointer max-h-56 md:max-h-80 object-cover shadow-[inset_0px_0px_0px_1px_rgba(0,0,0,0.10)]"
          />
          {imgExpanded && (
            <LightBoxImage
              onClose={() => setImgExpanded(false)}
              imageSrc={previewImage}
              alt="preview appartamento"
            />
          )}
        </div>
      )}
      <div className={bubbleClassName}>
        {isEditing ? (
          <UserMessageEditor
            value={editContent}
            onChange={onEditChange}
            onSave={onEditSave}
            onCancel={onEditCancel}
            onKeyDown={onEditKeyDown}
          />
        ) : (
          <UserMessageContent
            message={message}
            isEmojiOnlyMessage={isEmojiOnlyMessage}
            isBookingPreview={isBookingPreview}
            bookingDetails={bookingDetails}
            isMyMessage={isMyMessage}
          />
        )}
      </div>
    </>
  );
};

export default UserMessageBubble;
