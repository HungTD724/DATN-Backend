const cloudinary = require("cloudinary").v2;

// Cấu hình Cloudinary với thông tin tài khoản của bạn
cloudinary.config({
  cloud_name: "dvqmndx5j", // thay bằng cloud_name của bạn
  api_key: `https://api.cloudinary.com/v1_1/dvqmndx5j/image/upload`, // thay bằng api_key của bạn
  api_secret: "https://api.cloudinary.com/v1_1/dvqmndx5j/image/upload", // thay bằng api_secret của bạn
});

const UploadImage = (imageUrl) => {
  cloudinary.uploader.upload(imageUrl, { folder: "your_folder" }, (error, result) => {
    if (error) {
      console.log("Lỗi upload:", error);
    } else {
      console.log("Kết quả upload:", result);
    }
  });
};

module.exports = {
  UploadImage,
};
