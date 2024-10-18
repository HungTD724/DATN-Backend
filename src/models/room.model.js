const { Schema, model } = require("mongoose");

const DOCUMENT_NAME = "room";
const COLLECTION_NAME = "rooms";

function generateRoomCode() {
  const randomNumber = Math.floor(100000 + Math.random() * 900000); // Tạo số ngẫu nhiên có 6 chữ số
  return `room_${randomNumber}`;
}

const roomSchema = new Schema(
  {
    user: {
      // Người tạo phòng
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      // Tiêu đề
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: "",
    },
    roomCode: {
      // Mã phòng
      type: String,
      // required: true
    },
    startPrice: {
      // Giá khởi điểm
      type: Number,
      default: 0,
    },
    priceStep: {
      // Bước giá
      type: Number,
    },
    currentPrice: {
      // Giá hiện tại
      type: Number,
    },
    highestBidder: {
      // Người trả giá cao nhất
      type: String,
      default: null,
    },
    startDate: {
      // Ngày bắt đầu (timestamp)
      type: Date,
    },
    endDate: {
      // Ngày kết thúc (timestamp)
      type: Date,
    },
    status: {
      type: String,
      default: "Đang diễn ra",
    },
    bidHistory: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

roomSchema.pre("save", function (next) {
  this.roomCode = generateRoomCode();
  next();
});

module.exports = model(DOCUMENT_NAME, roomSchema);
