const { Types } = require("mongoose");
const { BadRequestError, NotFoundError } = require("../core/error.response");
const { CREATED, SuccessResponse } = require("../core/success.response");
const roomModel = require("../models/room.model");
const userModel = require("../models/user.model");
const cron = require("node-cron");
const { sendEmail } = require("../utils/postMail");
class RoomService {
  static createRoom = async ({ userId, itemName, title, description, file, startPrice, priceStep, startDate, endDate }) => {
    if (new Date(endDate) < new Date()) {
      throw new BadRequestError("Ngày kết thúc phải lớn hơn thời gian hiện tại.");
    }

    if (new Date(endDate) < new Date(startDate)) {
      throw new BadRequestError("Thời gian kết thúc phải lớn hơn thời gian bắt đầu.");
    }

    if (priceStep <= 0) {
      throw new BadRequestError("Bước giá phải lơn hơn 0.");
    }

    const newRoom = await roomModel.create({
      user: userId,
      title: itemName,
      description,
      image: file,
      startPrice,
      currentPrice: startPrice,
      priceStep,
      startDate,
      endDate,
    });

    console.log(newRoom);

    return {
      message: "Create ROOM success",
      data: newRoom,
    };
  };

  static getAllRoom = async ({ page, limit }) => {
    const skip = (page - 1) * limit;

    const rooms = roomModel.find().skip(skip).limit(limit);
    return rooms;
  };

  static getDetailRoom = async ({ roomId }) => {
    const room = roomModel.findById(roomId);
    return room;
  };

  static getMyRoom = async ({ userId, page, limit }) => {
    const skip = (page - 1) * limit;

    const myRooms = roomModel
      .find({ user: new Types.ObjectId(userId) })
      .skip(skip)
      .limit(limit);
    return myRooms;
  };

  static sendEmailAuctionSuccessful = async ({ uidOfHighestBid, auction }) => {
    const { title, startPrice, endDate, image, currentPrice } = auction;

    console.log({ uidOfHighestBid });
    const holderUser = await userModel.findById({ _id: uidOfHighestBid }).lean();
    console.log(holderUser);

    const emailSubject = "Xác Nhận Đấu Giá Thành Công!!";
    const emailBody = `
    Chúc mừng bạn!<br><br>
    Bạn đã đấu giá thành công sản phẩm: <strong>${title}</strong><br>
    <img src=${image} />
    Giá khởi điểm: <strong>${startPrice.toLocaleString()} VNĐ</strong><br>
    Giá đấu giá thành công: <strong>${currentPrice.toLocaleString()} VNĐ</strong><br>
    Thời gian kết thúc đấu giá: <strong>${new Date(endDate).toLocaleString()}</strong><br><br>
    
    Cảm ơn bạn đã tham gia đấu giá!`;

    await sendEmail(holderUser.email, emailSubject, emailBody);
  };

  static handleAuction = async ({ uid, roomId, bidAmount }) => {
    const user = await userModel.findById(uid).lean();
    const room = await roomModel.findById(roomId);
    bidAmount = Number(bidAmount);

    console.log(bidAmount);
    console.log(user);
    console.log(roomId);

    // if (uid === room.user.toString()) {
    //   throw new BadRequestError("Bạn không thể tự đẩy giá phòng của mình.");
    // }

    if (!room) {
      throw new NotFoundError("Phòng đấu giá không tồn tại.");
    }

    if (bidAmount < room.currentPrice + room.priceStep) {
      throw new BadRequestError(`Bước giá phải lớn hơn ${room.priceStep}`);
    }
    // giá mới nhất

    room.currentPrice = bidAmount;
    room.highestBidder = user.fullName;
    room.bidHistory.push({
      uid: user._id,
      bidAmount,
      time: new Date(),
    });

    console.log({ room });

    await room.save();

    const minutes = room.endDate.getUTCMinutes(); // 0
    const hours = room.endDate.getUTCHours(); // 0
    const day = room.endDate.getUTCDate(); // 18
    const month = room.endDate.getUTCMonth() + 1; // Tháng trong JavaScript bắt đầu từ 0, nên cần cộng thêm 1

    // Thiết lập lịch chạy cron dựa trên endDate
    cron.schedule(`${minutes} ${hours} ${day} ${month} *`, async () => {
      console.log("Đã đến ngày và giờ cần thực hiện hành động!");

      const highestBid = bidHistory.reduce((max, bid) => (bid.bidAmount > max.bidAmount ? bid : max));
      const holderUser = await userModel.findById({ _id: highestBid }).lean();
      console.log(holderUser);

      const emailSubject = "Xác Nhận Đấu Giá Thành Công!!";
      const emailBody = `
    Chúc mừng bạn!<br><br>
    Bạn đã đấu giá thành công sản phẩm: <strong>${title}</strong><br>
    <img src=${image} />
    Giá khởi điểm: <strong>${startPrice.toLocaleString()} VNĐ</strong><br>
    Giá đấu giá thành công: <strong>${currentPrice.toLocaleString()} VNĐ</strong><br>
    Thời gian kết thúc đấu giá: <strong>${new Date(endDate).toLocaleString()}</strong><br><br>
    
    Cảm ơn bạn đã tham gia đấu giá!`;

      await sendEmail(holderUser.email, emailSubject, emailBody);
      return;
    });

    return room;
  };
}

module.exports = RoomService;
