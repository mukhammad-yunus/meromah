import React, { useEffect, useState } from "react";
import { X, Link as LinkIcon, Copy } from "lucide-react";
import { facebookLogo, telegramLogo, whatsappLogo, xLogo } from "../../../assets";

const ShareModal = ({ isOpen, onClose, itemUrl, itemTitle }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setCopied(false);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose(e);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopyLink = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(itemUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const shareOptions = [
    {
      id: "copy",
      name: "Copy Link",
      icon: copied ? Copy : LinkIcon,
      color: "bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-200",
      action: handleCopyLink,
      iconFrom: "lucide"
    },
    {
      id: "twitter",
      name: "Twitter",
      icon: xLogo,
      color: "bg-black hover:bg-gray-800 text-white",
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        itemUrl
      )}&text=${encodeURIComponent(itemTitle || "")}`,
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: facebookLogo,
      color: "bg-blue-600 hover:bg-blue-700 text-white",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        itemUrl
      )}`,
    },
    {
      id: "telegram",
      name: "Telegram",
      icon: telegramLogo,
      color: "bg-blue-500 hover:bg-blue-600 text-white",
      url: `https://t.me/share/url?url=${encodeURIComponent(
        itemUrl
      )}&text=${encodeURIComponent(itemTitle || "")}`,
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      icon: whatsappLogo,
      color: "bg-green-500 hover:bg-green-600 text-white",
      url: `https://wa.me/?text=${encodeURIComponent(
        (itemTitle || "") + " " + itemUrl
      )}`,
    },
  ];

  const handleShareClick = (option, e) => {
    e.stopPropagation();
    if (option.action) {
      option.action(e);
    } else if (option.url) {
      window.open(option.url, "_blank", "noopener,noreferrer");
      onClose(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm cursor-default"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-md w-full mx-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 dark:text-neutral-400 hover:text-gray-600 dark:hover:text-neutral-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-neutral-600 rounded-full p-1 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-neutral-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-neutral-100">Share this post</h2>
          <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
            Choose how you want to share
          </p>
        </div>

        {/* Share Options */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-3">
            {shareOptions.map((option) => {
              const iconFrom = option?.iconFrom ?? "custom"
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={(e) => handleShareClick(option, e)}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg transition-all duration-200 ${option.color} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 cursor-pointer`}
                >
                  {iconFrom === "lucide" ?<Icon className="w-6 h-6"/>: <img src={option.icon} className="w-6 h-6" />}
                  <span className="text-sm font-medium">{option.name}</span>
                  {option.id === "copy" && copied && (
                    <span className="text-xs text-green-600 font-semibold">
                      Copied!
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* URL Preview */}
        <div className="px-6 pb-6">
          <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-3 border border-gray-200 dark:border-neutral-700">
            <p className="text-xs text-gray-500 dark:text-neutral-400 mb-1">Link to share:</p>
            <p className="text-sm text-gray-700 dark:text-neutral-300 break-all">{itemUrl}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
