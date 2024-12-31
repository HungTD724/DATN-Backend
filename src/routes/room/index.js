const express = require("express");
const roomController = require("../../controllers/room.controller");
const asyncHandler = require("../../helpers/asyncHandle");
const { authentication } = require("../../auth/authUtils");
const { uploadFile } = require("../../middleware");

const router = express.Router();

// router.use(authentication)

router.get("/", asyncHandler(roomController.getAllRoom));
router.get("/not-confirmed", asyncHandler(roomController.notConfirmed));
router.get("/not-confirmed-useId/:userId", asyncHandler(roomController.notConfirmedUseId));
router.get("/allRoomEnd", asyncHandler(roomController.allRoomEnd));
router.get("/my-room/:userId", asyncHandler(roomController.getMyRoom));
router.get("/detail-room/:roomId", asyncHandler(roomController.getDetailRoom));
router.get("/done-room/:userId", asyncHandler(roomController.getDoneRooms));
router.post("/", uploadFile.single("picture"), asyncHandler(roomController.createRoom));
router.post("/acceptRoom", uploadFile.single("picture"), asyncHandler(roomController.acceptRoom));
router.post("/auction", asyncHandler(roomController.handleAuction));
router.post("/auction-end", asyncHandler(roomController.auctionEnd)); 
router.post("/nhan-hang", asyncHandler(roomController.auctionNhanHang)); 
router.post("/huy-hang", asyncHandler(roomController.auctionHuyHang)); 




router.post("/send-email-auction-successful", asyncHandler(roomController.sendEmailAuctionSuccessful));

module.exports = router;
