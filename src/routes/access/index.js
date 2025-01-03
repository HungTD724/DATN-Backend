const express = require("express");
const accessController = require("../../controllers/access.controller");
const asyncHandler = require("../../helpers/asyncHandle");
const { authentication } = require("../../auth/authUtils");

const router = express.Router();

router.get("/getAllUser/:userId", asyncHandler(accessController.getAllUser));
router.post("/signup", asyncHandler(accessController.signUp));
router.post("/login", asyncHandler(accessController.login));
router.post("/verify-email", asyncHandler(accessController.verifyEmail));
router.get("/getUser/:userId", asyncHandler(accessController.getUser));
router.get("/deduct-money/:userId", asyncHandler(accessController.deductMoney));
router.post("/delete-customer/:userId", asyncHandler(accessController.deleteUser)); 
router.patch('/update', asyncHandler(accessController.updateUser))
// router.use(authentication)

router.post("/logout", asyncHandler(accessController.logout));
router.post("/refreshToken", asyncHandler(accessController.handleRefreshToken));

module.exports = router;
