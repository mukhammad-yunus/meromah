import { useState } from "react";
import { getFileUrl, getInitials } from "../utils";

const CommunityAvatar = ({
  hash,
  name,
  alt = "Community avatar",
  gradientClassName = "bg-gradient-to-br from-blue-500 to-purple-600",
  sizeClassName = "font-black text-xl",
}) => {
  const [failed, setFailed] = useState(false);

  if (!hash || failed) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center text-white ${sizeClassName} ${gradientClassName}`}
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    <img
      src={getFileUrl(hash)}
      alt={alt}
      className="w-full h-full object-cover"
      onError={() => setFailed(true)}
    />
  );
};

export default CommunityAvatar;
