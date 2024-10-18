const { Schema, model } = require("mongoose");
const slugify = require("slugify");

const DOCUMENT_NAME = "User";
const COLLECTION_NAME = "users";

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      trim: true,
      maxLength: 100,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
      required: true, // Có thể điều chỉnh yêu cầu tùy theo logic ứng dụng
    },
    birthDate: {
      type: Date, // Để lưu ngày sinh, sử dụng kiểu Date
      default: null,
    },
    address: {
      type: String,
      default: "",
    },
    idNumber: {
      type: String,
      default: "",
    },
    idIssueDate: {
      type: Date, // Sử dụng kiểu Date cho ngày cấp ID
      default: null,
    },
    idIssuePlace: {
      type: String,
      default: "",
    },
    bankAccountNumber: {
      type: String,
      default: "",
    },
    bankName: {
      type: String,
      default: "",
    },
    bankAccountHolder: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    gender: {
      type: String,
      enum: ["male", "female", "Khác", null],
      default: null,
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "user"],
      default: "user",
    },
    agree1: {
      type: Boolean,
      default: false,
    },
    agree2: {
      type: Boolean,
      default: false,
    },
    moneys: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

userSchema.pre("validate", function (next) {
  const randomId = Math.floor(Math.random() * 90000);
  this.slug = slugify(`${this.fullName}.${randomId.toString()}`, { lower: true, locale: "vi" });
  next();
});

module.exports = model(DOCUMENT_NAME, userSchema);
