const { Types } = require("mongoose");
const { BadRequestError, NotFoundError } = require("../core/error.response");
const { CREATED, SuccessResponse } = require("../core/success.response");
const roomModel = require("../models/room.model");
const userModel = require("../models/user.model");
const cron = require("node-cron");
const { sendEmail } = require("../utils/postMail");
const { UploadImage } = require("../utils/cloudinary");
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

    const rooms = roomModel
      .find({
        status: "Đang diễn ra",
      })
      .skip(skip)
      .limit(limit);
    return rooms;
  };

    static notConfirmed = async ({ page, limit }) => {
    const skip = (page - 1) * limit;

    const rooms = await roomModel
      .find({
        status: "Chưa được duyệt",
      })
      .skip(skip)
      .limit(limit);
    return rooms;
  };

  static notConfirmedUseId = async ({userId }) => {

    const rooms = await roomModel
      .find({
        status: "Chưa được duyệt",
        user: userId
      })
    console.log({ userId })
    console.log({rooms})
    
    return rooms;
  };


 static acceptRoom = async ({ roomId, status }) => {
  // Find the room by its ID
  const room = await roomModel.findById(roomId);

  // Check if the room exists
  if (!room) {
    throw new Error("Room not found");
  }

  // Update the room's status
  room.status = status;

  // Save the updated room
  return await room.save();
};


  static allRoomEnd = async ({ page, limit }) => {
    const skip = (page - 1) * limit;

    const rooms = roomModel
      .find({
        status: "Đã kết thúc",
      })
      .skip(skip)
      .limit(limit);
    return rooms;
  };

  static getDetailRoom = async ({ roomId }) => {
    const room = roomModel.findById(roomId);
    return room;
  };


    static getDoneRooms = async ({ userId }) => {
    const room = roomModel.find({currentId :userId , status: 'Đã kết thúc'});
    return room;
  };

  static getMyRoom = async ({ userId, page = 1, limit = 10 }) => {
    const skip = (page - 1) * limit;

    const myRooms = roomModel
      .find({ user: new Types.ObjectId(userId) })
      .skip(skip)
      .limit(limit);
    return myRooms;
  };

  static auctionEnd = async ({ roomId }) => {
    const myRooms = await roomModel.findById({ _id: new Types.ObjectId(roomId) });

    console.log({myRooms})

    myRooms.status = "Đã kết thúc";
    const highestBid = myRooms?.bidHistory.reduce((max, bid) => (bid.bidAmount > max.bidAmount ? bid : max), myRooms.bidHistory[0]);
    // Lấy uid tương ứng với bidAmount lớn nhất
    const uidWithHighestBid = highestBid?.uid;
    if(uidWithHighestBid) {

    const holderUser = await userModel.findById({ _id: uidWithHighestBid }).lean();
    console.log(holderUser);

    const emailSubject = "Xác Nhận Đấu Giá Thành Công!!";
    const emailBody = `
    Chúc mừng bạn!<br><br>
    Bạn đã đấu giá thành công sản phẩm: <strong>${myRooms?.title}</strong><br>
    <img src=${myRooms?.image} style={{
      widht: '100px',
      height: '100px'
    }} />
     Giá khởi điểm: <strong>${myRooms?.startPrice.toLocaleString()} VNĐ</strong><br>
    Giá đấu giá thành công: <strong>${myRooms?.currentPrice.toLocaleString()} VNĐ</strong><br>
    Thời gian kết thúc đấu giá: <strong>${new Date(myRooms?.endDate).toLocaleString()}</strong><br><br>
    
    Cảm ơn bạn đã tham gia đấu giá!`;

    await sendEmail(holderUser?.email, emailSubject, emailBody);
    
    return myRooms.save();
  }
  else {
    myRooms.save();
    return "Kết thúc phiên đấu giá thành công"
  }
    // return myRooms.save();
  };


  static auctionNhanHang = async ({roomId, values}) => {
      const myRooms = await roomModel.findById({ _id: new Types.ObjectId(roomId) });

      console.log({myRooms})

      myRooms.status = "Đã nhận hàng";
    
    // myRooms.save();

    // return 'Nhận hàng thành công'
   
      const emailSubject = "Xác Nhận Nhận Giải!!";
      const emailBody = `
        Xin chào ${values.name},<br><br>
        Chúc mừng bạn! Bạn đã đấu giá thành công sản phẩm: <strong>${myRooms?.title}</strong><br>
        <img src=${myRooms?.image} style="width: 100px; height: 100px;" /><br>
        Giá khởi điểm: <strong>${myRooms?.startPrice.toLocaleString()} VNĐ</strong><br>
        Giá đấu giá thành công: <strong>${myRooms?.currentPrice.toLocaleString()} VNĐ</strong><br>
        Thời gian kết thúc đấu giá: <strong>${new Date(myRooms?.endDate).toLocaleString()}</strong><br><br>

        Chúng tôi xin xác nhận rằng bạn đã chấp nhận nhận giải thưởng trúng giá và hẹn gặp vào ngày <strong>${values?.meetingDate}</strong> để lấy giải thưởng.<br>
        Dưới đây là thông tin xác nhận của bạn:<br><br>
        <strong>Họ và tên:</strong> ${values.name}<br>
        <strong>Email:</strong> ${values.email}<br>
        <strong>Số điện thoại:</strong> ${values.phone}<br><br>
        <strong>Nơi hẹn gặp:</strong> ${values.message}<br><br>


        Cảm ơn bạn đã tham gia đấu giá và chúng tôi rất mong được gặp bạn vào ngày hẹn!<br><br>
        Trân trọng,<br>
        Đội ngũ hỗ trợ đấu giá.
  `;

      await sendEmail(values.email, emailSubject, emailBody);
      
    return myRooms.save();
  };

     static auctionHuyHang = async ({ roomId }) => {
    const myRooms = await roomModel.findById(roomId);
    if (!myRooms) {
        throw new Error('Room not found');
    }

    let highestBid = null;
    let secondHighestBid = null;

    // Tìm highestBid và secondHighestBid
    for (const bid of myRooms.bidHistory) {
        if (!highestBid || bid.bidAmount > highestBid.bidAmount) {
            secondHighestBid = highestBid;
            highestBid = bid;
        } else if (!secondHighestBid || bid.bidAmount > secondHighestBid.bidAmount) {
            secondHighestBid = bid;
        }
    }

    // Cập nhật status của người có bid cao nhất
    if (highestBid) {
        highestBid.status = 'Từ chối nhận hàng';
    }

    // Cập nhật currentPrice và currentId cho người thứ hai
    if (secondHighestBid && secondHighestBid.status !== 'Từ chối nhận hàng') {
        const holderUser = await userModel.findById(secondHighestBid.uid).lean();
        if (!holderUser) throw new Error('User not found');

        myRooms.currentPrice = secondHighestBid.bidAmount;
        myRooms.currentId = secondHighestBid.uid;

        const emailSubject = "Xác Nhận Đấu Giá Thành Công!!";
      const emailBody = `
              Chúc mừng bạn!<br><br>
              Do một số lý do, bạn đã đấu giá thành công sản phẩm: <strong>${myRooms?.title}</strong><br>
              <img src="${myRooms?.image}" width="100" height="100" /><br>
              Giá khởi điểm: <strong>${myRooms?.startPrice.toLocaleString()} VNĐ</strong><br>
              Giá đấu giá thành công: <strong>${secondHighestBid.bidAmount.toLocaleString()} VNĐ</strong><br>
              Thời gian kết thúc đấu giá: <strong>${new Date(myRooms?.endDate).toLocaleString()}</strong><br><br>
              Cảm ơn bạn đã tham gia đấu giá!`;

        await sendEmail(holderUser.email, emailSubject, emailBody);
    }

    // Đánh dấu bidHistory là đã thay đổi và lưu lại
    myRooms.markModified('bidHistory');
    await myRooms.save();

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
    bidAmount = Number(bidAmount.replace(/\./g, ""));

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
    room.currentId = uid;
    room.highestBidder = user.fullName;
    room.bidHistory.push({
      uid: user._id,
      bidAmount,
      status: '',
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
