import React, { useEffect, useState } from "react";
import { FaTimes, FaLink, FaCopy } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FaFacebook, FaTelegram, FaWhatsapp } from "react-icons/fa";

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
      icon: copied ? FaCopy : FaLink,
      color: "bg-gray-100 hover:bg-gray-200 text-gray-700",
      action: handleCopyLink,
    },
    {
      id: "twitter",
      name: "Twitter",
      icon: FaXTwitter,
      color: "bg-black hover:bg-gray-800 text-white",
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        itemUrl
      )}&text=${encodeURIComponent(itemTitle || "")}`,
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: FaFacebook,
      color: "bg-blue-600 hover:bg-blue-700 text-white",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        itemUrl
      )}`,
    },
    {
      id: "telegram",
      name: "Telegram",
      icon: FaTelegram,
      color: "bg-blue-500 hover:bg-blue-600 text-white",
      url: `https://t.me/share/url?url=${encodeURIComponent(
        itemUrl
      )}&text=${encodeURIComponent(itemTitle || "")}`,
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      icon: FaWhatsapp,
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm cursor-default"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-full p-1 cursor-pointer"
          aria-label="Close modal"
        >
          <FaTimes className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Share this post</h2>
          <p className="text-sm text-gray-500 mt-1">
            Choose how you want to share
          </p>
        </div>

        {/* Share Options */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-3">
            {shareOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={(e) => handleShareClick(option, e)}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg transition-all duration-200 ${option.color} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 cursor-pointer`}
                >
                  <Icon className="w-6 h-6" />
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
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Link to share:</p>
            <p className="text-sm text-gray-700 break-all">{itemUrl}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
