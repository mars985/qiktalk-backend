const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "image",
    });
    return response;
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
    return null;
  }
};

const destroyOnCloudinary = async ({ public_id, options = {} }) => {
  try {
    const result = await cloudinary.uploader.destroy(public_id, {
      invalidate: true,
      ...options,
    });
    if (result.result !== "ok") {
      console.error("Cloudinary destroy returned:", result.result);
    }
  } catch (error) {
    console.error("Failed to destroy file on Cloudinary:", error);
  }
};

module.exports = { uploadOnCloudinary, destroyOnCloudinary };
