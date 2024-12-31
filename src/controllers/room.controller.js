const { SuccessResponse } = require("../core/success.response");
const RoomService = require("../services/room.service");

class RoomController {
  static createRoom = async (req, res, next) => {
    console.log(req.body);
    new SuccessResponse({
      message: "create room",
      metadata: await RoomService.createRoom({ ...req.body }),
    }).send(res);
  };

  static acceptRoom = async (req, res, next) => {
    console.log(req.body);
    new SuccessResponse({
      message: "chấp nhận thành công",
      metadata: await RoomService.acceptRoom({ ...req.body }),
    }).send(res);
  };

  static getAllRoom = async (req, res, next) => {
    new SuccessResponse({
      message: "get all room",
      metadata: await RoomService.getAllRoom(req.query),
    }).send(res);
  };

    static notConfirmed = async (req, res, next) => {
    new SuccessResponse({
      message: "get all room",
      metadata: await RoomService.notConfirmed(req.query),
    }).send(res);
  };

  
    static notConfirmedUseId = async (req, res, next) => {
    new SuccessResponse({
      message: "get all room",
      metadata: await RoomService.notConfirmedUseId(req.params),
    }).send(res);
  };

  static allRoomEnd = async (req, res, next) => {
    new SuccessResponse({
      message: "get all room",
      metadata: await RoomService.allRoomEnd(req.query),
    }).send(res);
  };

  static getDetailRoom = async (req, res, next) => {
    new SuccessResponse({
      message: "get detail room",
      metadata: await RoomService.getDetailRoom(req.params),
    }).send(res);
  };

   static getDoneRooms = async (req, res, next) => {
    new SuccessResponse({
      message: "get detail room",
      metadata: await RoomService.getDoneRooms(req.params),
    }).send(res);
  };

  static getMyRoom = async (req, res, next) => {
    new SuccessResponse({
      message: "get all room",
      metadata: await RoomService.getMyRoom(req.params),
    }).send(res);
  };

  static handleAuction = async (req, res, next) => {
    new SuccessResponse({
      message: "handleAuction",
      metadata: await RoomService.handleAuction({ uid: req.userId, ...req.body }),
    }).send(res);
  };

  static auctionEnd = async (req, res, next) => {
    new SuccessResponse({
      message: "handleAuction",
      metadata: await RoomService.auctionEnd(req.body),
    }).send(res);
  };

  static auctionNhanHang = async (req, res, next) => {
    new SuccessResponse({
      message: "handleAuction",
      metadata: await RoomService.auctionNhanHang(req.body),
    }).send(res);
  };

  static auctionHuyHang = async (req, res, next) => {
    new SuccessResponse({
      message: "auctionHuyHang",
      metadata: await RoomService.auctionHuyHang(req.body),
    }).send(res);
  };

  static sendEmailAuctionSuccessful = async (req, res, next) => {
    new SuccessResponse({
      message: "sendEmailAuctionSuccessful",
      metadata: await RoomService.sendEmailAuctionSuccessful(req.body),
    }).send(res);
  };
}

module.exports = RoomController;
