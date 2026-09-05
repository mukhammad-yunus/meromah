import React, { useCallback, useState } from "react";
import ImageModal from "./ImageModal";
import { getFileUrl } from "../../../utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PostImages = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentImage =
    Array.isArray(images) && images.length > 0 ? images[currentIndex] : image;
  const hasMultipleImages = Array.isArray(images) && images.length > 1;

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

  if (!images || images.length === 0) return null;
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

  return (
    <>
      <div className="flex items-center justify-center bg-black/55 backdrop-blur-sm cursor-default">
        <div className="relative w-full h-full mx-4">
          {/* Navigation buttons */}
          {hasMultipleImages && (
            <>
              <button
                onClick={(e) => handlePrevious(e)}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all duration-200 focus:outline-none hover:ring-2 hover:ring-white cursor-pointer"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => handleNext(e)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all duration-200 focus:outline-none hover:ring-2 hover:ring-white  cursor-pointer"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              {/* Image counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {currentIndex + 1} / {images.length}
              </div>
            </>
          )}

          {/* Image */}
          <div className="flex items-center justify-center h-full">
            <img
              src={getFileUrl(currentImage.hash)}
              alt={`Post image ${currentIndex + 1}`}
              className="max-w-full w-full object-contain"
              onClick={(e) => handleImageClick(currentImage, e)}
              loading="lazy"
            />
          </div>
        </div>
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
