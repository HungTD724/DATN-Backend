const { Types } = require("mongoose")
const { BadRequestError, NotFoundError } = require("../core/error.response")
const { CREATED, SuccessResponse } = require('../core/success.response')
const roomModel = require("../models/room.model")
const userModel = require("../models/user.model")

class RoomService {
    static createRoom = async ({ user, title, description, file, startPrice, priceStep, startDate, endDate }) => {
        if (new Date(endDate) < new Date) {
            throw new BadRequestError('Ngày kết thúc phải lớn hơn thời gian hiện tại.')
        }

        if (new Date(endDate) < new Date(startDate)) {
            throw new BadRequestError('Thời gian kết thúc phải lớn hơn thời gian bắt đầu.')
        }

        if (priceStep <= 0) {
            throw new BadRequestError('Bước giá phải lơn hơn 0.')
        }

        const newRoom = await roomModel.create({
            user,
            title,
            description,
            image: file.path,
            startPrice,
            currentPrice: startPrice,
            priceStep,
            startDate,
            endDate
        })

        console.log(newRoom);

        return {
            message: 'Create ROOM success',
            data: newRoom,
        }
    }

    static getAllRoom = async ({ page, limit }) => {
        const skip = (page - 1) * limit

        const rooms = roomModel.find().skip(skip).limit(limit)
        return rooms
    }

    static getMyRoom = async ({ userId, page, limit }) => {
        const skip = (page - 1) * limit

        const myRooms = roomModel.find({ user: new Types.ObjectId(userId) }).skip(skip).limit(limit)
        return myRooms
    }

    static handleAuction = async ({ uid, roomId, price }) => {
        const user = await userModel.findById(uid).lean()
        const room = await roomModel.findById(roomId)

        console.log(user);
        console.log(roomId);


        if (uid === room.user.toString()) {
            throw new BadRequestError('Bạn không thể tự đẩy giá phòng của mình.')
        }

        if (!room) {
            throw new NotFoundError('Phòng đấu giá không tồn tại.')
        }

        if (price < (room.currentPrice + room.priceStep)) {
            throw new BadRequestError(`Bước giá phải lớn hơn ${room.priceStep}`)
        }
        // giá mới nhất

        room.currentPrice = price
        room.highestBidder = user.name
        room.bidHistory.push({
            uid: user._id,
            price,
            time: new Date
        })

        await room.save()

        return room
    }
}

module.exports = RoomService