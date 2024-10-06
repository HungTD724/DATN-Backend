
const { SuccessResponse } = require("../core/success.response")
const RoomService = require("../services/room.service")

class RoomController {
    static createRoom = async (req, res, next) => {
        const { file } = req
        new SuccessResponse({
            message: "create room",
            metadata: await RoomService.createRoom({ user: req.user.userId, ...req.body, file })
        }).send(res)
    }

    static getAllRoom = async (req, res, next) => {
        new SuccessResponse({
            message: "get all room",
            metadata: await RoomService.getAllRoom(req.query)
        }).send(res)
    }

    static getMyRoom = async (req, res, next) => {
        new SuccessResponse({
            message: "get all room",
            metadata: await RoomService.getMyRoom({ userId: req.user.userId, ...req.query })
        }).send(res)
    }

    static handleAuction = async (req, res, next) => {
        new SuccessResponse({
            message: "handleAuction",
            metadata: await RoomService.handleAuction({ uid: req.user.userId, ...req.body })
        }).send(res)
    }
}

module.exports = RoomController