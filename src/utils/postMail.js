const nodemailer = require("nodemailer");

// Tạo cấu hình cho dịch vụ email

// Cấu hình chi tiết email
const sendEmail = (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "ngoxuanquy1812@gmail.com",
      pass: "bgoz fvvx raus cqjo", // Consider using environment variables for sensitive information
    },
  });
  console.log(to);
  const mailOptions = {
    from: "ngoxuanquy1812@gmail.com", // Địa chỉ người gửi
    to: to, // Địa chỉ người nhận
    subject: subject, // Tiêu đề email
    text: text, // Nội dung email
  };

  // Gửi email
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log("Lỗi khi gửi email:", error);
    } else {
      console.log("Email đã được gửi:", info.response);
    }
  });
};

module.exports = {
  sendEmail,
};
