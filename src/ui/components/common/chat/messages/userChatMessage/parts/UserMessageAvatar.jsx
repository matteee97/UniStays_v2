import Avatar from "../../../Avatar";
const UserMessageAvatar = ({ avatar, showAvatar, senderName }) => {
  const visibilityClass = showAvatar ? "opacity-100" : "opacity-0";

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={senderName || "Utente"}
        className={`w-8 h-8 rounded-full object-cover border border-[#228E8D] ${visibilityClass}`}
      />
    );
  }

  return <Avatar className={visibilityClass} />;
};

export default UserMessageAvatar;
