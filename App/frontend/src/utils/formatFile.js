export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const getMessageType = (fileType, fileName) => {
  if (!fileType && !fileName) return "TEXT";
  const type = fileType?.toLowerCase() || "";
  const name = fileName?.toLowerCase() || "";
  if (type.includes("image") || /\.(jpg|jpeg|png|gif|webp|svg)$/.test(name)) return "IMAGE";
  if (type.includes("video") || /\.(mp4|webm|ogg)$/.test(name)) return "VIDEO";
  return "FILE";
};