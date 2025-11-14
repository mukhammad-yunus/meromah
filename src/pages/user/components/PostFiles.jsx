import React, { useRef } from "react";
import {
  FaFile,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFileArchive,
} from "react-icons/fa";
import { handleDownload } from "../../../utils";

const PostFiles = ({ files }) => {
  const downloadRef = useRef(null)
  if (!files || files.length === 0) return null;

  const getFileIcon = (mimetype) => {
    if (mimetype.includes("pdf")) {
      return <FaFilePdf className="w-5 h-5 text-red-500" />;
    } else if (mimetype.includes("word") || mimetype.includes("document")) {
      return <FaFileWord className="w-5 h-5 text-blue-500" />;
    } else if (mimetype.includes("excel") || mimetype.includes("spreadsheet")) {
      return <FaFileExcel className="w-5 h-5 text-green-500" />;
    } else if (
      mimetype.includes("zip") ||
      mimetype.includes("archive") ||
      mimetype.includes("compressed")
    ) {
      return <FaFileArchive className="w-5 h-5 text-yellow-500" />;
    }
    return <FaFile className="w-5 h-5 text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 B";

    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="mt-3 space-y-2">
      {files.map((file) => (
        <button
          key={file.hash}
          onClick={(e) => handleDownload(file, e, downloadRef.current)}
          ref={downloadRef}
          className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex-shrink-0">{getFileIcon(file.mimetype)}</div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {file.filename}
            </p>
            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
          </div>
          <div className="flex-shrink-0">
            <FaFile className="w-4 h-4 text-gray-400" />
          </div>
        </button>
      ))}
    </div>
  );
};

export default PostFiles;
