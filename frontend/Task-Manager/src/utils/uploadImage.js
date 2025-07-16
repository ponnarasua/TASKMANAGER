import axiosInstance from './axiosInstance'; // 🔁 instead of plain axios
import { API_PATHS } from './apiPaths';

const uploadImage = async (file) => {
  const fileName = `${Date.now()}_${file.name}`;

  try {
    console.log("📥 Upload Request Body:", {
  filePreview: file?.substring(0, 100),
  fileName
});

    const response = await axiosInstance.post(API_PATHS.IMAGE.UPLOAD_IMAGE, {
      file,
      fileName,
    });
    console.log("✅ ImageKit response:", response.data);
    return response.data;
  } catch (err) {
    console.error("❌ uploadImage failed:", err.response?.data || err.message);
    throw err;
  }
};

export default uploadImage;
