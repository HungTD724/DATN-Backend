const express = require("express");

const router = express.Router();

router.use("/room", require("./room"));
router.use("/auth", require("./access"));
router.use("/pay", require("./VnPay"));

module.exports = router;
