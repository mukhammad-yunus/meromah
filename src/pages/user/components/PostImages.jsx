import React, { useState } from "react";
import ImageModal from "./ImageModal";

const PostImages = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!images || images.length === 0) return null;

  const getFileUrl = (hash) => {
    const API_BASE_URL = import.meta.env.DEV
      ? "/api"
      : import.meta.env.VITE_API_BASE_URL || "/api";
    return `${API_BASE_URL}/files/${hash}`;
  };

  const handleImageClick = (image, e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const handleCloseModal = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  // Get first 4 images for display
  const displayImages = images.slice(0, 4);
  const remainingCount = images.length - 4;

  // Determine grid layout based on number of images
  const getGridClass = () => {
    switch (displayImages.length) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-2";
      case 3:
        return "grid-cols-2";
      case 4:
        return "grid-cols-2";
      default:
        return "grid-cols-2";
    }
  };

  const getImageClass = (index) => {
    if (displayImages.length === 1) {
      return "col-span-1";
    } else if (displayImages.length === 3 && index === 0) {
      return "row-span-2";
    }
    return "";
  };

  return (
    <>
      <div
        className={`grid ${getGridClass()} gap-1 rounded-lg overflow-hidden mt-3 max-h-[500px]`}
      >
        {displayImages.map((image, index) => {
          const isLastWithOverlay = index === 3 && remainingCount > 0;

          return (
            <div
              key={image.hash}
              className={`relative cursor-pointer overflow-hidden ${getImageClass(
                index
              )}`}
              onClick={(e) => handleImageClick(image, e)}
            >
              <div
                className={`relative w-full group flex items-center justify-center ${
                  displayImages.length === 1
                    ? "h-[500px]"
                    : displayImages.length === 3 && index === 0
                    ? "h-full"
                    : "aspect-square"
                }`}
              >
                {/* Blurred background of the same image */}
                <img
                  src={getFileUrl(image.hash)}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover blur-3xl scale-110 opacity-60"
                />

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/35 group-hover:bg-black/70 transition-colors duration-400 ease-in-out" />

                {/* Main image */}
                <img
                  src={getFileUrl(image.hash)}
                  alt={`Post image ${index + 1}`}
                  className="relative z-10 max-w-full max-h-full object-contain transition-transform duration-300 ease-out"
                  loading="lazy"
                />

                {isLastWithOverlay && (
                  <div className="absolute inset-0 z-20">
                    {/* Extra dark overlay for +N */}
                    <div className="absolute inset-0 bg-black/50" />

                    {/* Counter */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white text-5xl font-bold drop-shadow-2xl">
                        +{remainingCount}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Image Modal */}
      <ImageModal
        image={selectedImage}
        images={images}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default PostImages;
