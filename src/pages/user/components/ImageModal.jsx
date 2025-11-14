import React, { useEffect, useState, useCallback } from "react";
import {
  FaTimes,
  FaDownload,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
const ImageModal = ({ image, images, isOpen, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentImage =
    images && images.length > 0 ? images[currentIndex] : image;
  const hasMultipleImages = images && images.length > 1;

  const handlePrevious = useCallback(
    (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (hasMultipleImages && images) {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      }
    },
    [hasMultipleImages, images]
  );

  const handleNext = useCallback(
    (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (hasMultipleImages && images) {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      }
    },
    [hasMultipleImages, images]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Find the index of the current image in the images array
      if (images && images.length > 0 && image) {
        const index = images.findIndex((img) => img.hash === image.hash);
        setCurrentIndex(index >= 0 ? index : 0);
      }
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, image, images]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen || !images || images.length === 0) return;
      if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "Escape") {
        onClose(e);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, images, onClose, handlePrevious, handleNext]);

  if (!isOpen || !image) return null;

  const getFileUrl = (hash) => {
    const API_BASE_URL = import.meta.env.DEV
      ? "/api"
      : import.meta.env.VITE_API_BASE_URL || "/api";
    return `${API_BASE_URL}/files/${hash}`;
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      const blob = await downloadFile(currentImage.hash).unwrap();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `image-${currentImage.hash}.${
        currentImage.mimetype.split("/")[1]
      }`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm cursor-default"
      onClick={onClose}
    >
      <div className="relative w-full h-full mx-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white cursor-pointer"
          aria-label="Close modal"
        >
          <FaTimes className="w-5 h-5" />
        </button>

        {/* Download button */}
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50 cursor-pointer" 
          aria-label="Download image"
        >
          <FaDownload className="w-5 h-5" />
        </button>

        {/* Navigation buttons */}
        {hasMultipleImages && (
          <>
            <button
              onClick={(e) => handlePrevious(e)}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all duration-200 focus:outline-none hover:ring-2 hover:ring-white cursor-pointer"
              aria-label="Previous image"
            >
              <FaChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => handleNext(e)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all duration-200 focus:outline-none hover:ring-2 hover:ring-white  cursor-pointer"
              aria-label="Next image"
            >
              <FaChevronRight className="w-5 h-5" />
            </button>
            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}

        {/* Image */}
        <div className="flex items-center justify-center h-full">
          <img
            src={getFileUrl(currentImage.hash)}
            alt={`Post image ${currentIndex + 1}`}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
