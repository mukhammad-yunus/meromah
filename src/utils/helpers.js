export const toQueryString = (params) => {
  if (!params || Object.keys(params).length === 0) {
    return "";
  }
  return `?${new URLSearchParams(params).toString()}`;
};
export const getImage = (e) => {
  const files = Array.from(e.target.files);
  const newImages = files
    .filter((file) => file.type.startsWith("image/"))
    .map((file) => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file),
      isUploading: true,
      error: false
    }));
  return newImages;
};
export const getFile = (e) => {
  const files = Array.from(e.target.files);
  const newFiles = files
    .filter((file) => !file.type.startsWith("image/"))
    .map((file) => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      isUploading: true,
      error: false
    }));
  return newFiles;
};
