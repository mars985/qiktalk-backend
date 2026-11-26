const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath, options = {}) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      ...options,
    });
    return response;
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
    return null;
  }
};

const uploadSquareImage = async (localFilePath, size) => {
  const response = await uploadOnCloudinary(localFilePath, {
    resource_type: "image",
    eager: [{ width: size, height: size, crop: "fill", gravity: "center" }],
  });
  if (!response) return null;

  const croppedUrl = response.eager?.[0]?.secure_url;
  if (!croppedUrl) {
    console.error("Cloudinary crop failed:", response.eager);
    await destroyOnCloudinary({ public_id: response.public_id });
    return null;
  }

  return { url: croppedUrl, publicId: response.public_id };
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

module.exports = {
  uploadOnCloudinary,
  uploadSquareImage,
  destroyOnCloudinary,
};
