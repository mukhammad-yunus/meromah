import { getFileUrl } from "../utils";

export const DEFAULT_USER_AVATAR = "/images/default/user-avatar.svg";

const UserAvatar = ({
  hash,
  alt = "User avatar",
  className = "w-full h-full object-cover",
  loading,
}) => (
  <img
    src={hash ? getFileUrl(hash) : DEFAULT_USER_AVATAR}
    alt={alt}
    className={className}
    loading={loading}
    onError={(e) => {
      e.currentTarget.onerror = null;
      e.currentTarget.src = DEFAULT_USER_AVATAR;
    }}
  />
);

export default UserAvatar;
