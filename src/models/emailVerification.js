const { Schema, model } = require("mongoose");

const DOCUMENT_NAME = "emailVerification";
const COLLECTION_NAME = "emailVerifications";

const roomSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    verificationCode: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now, expires: "1h" },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, roomSchema);
