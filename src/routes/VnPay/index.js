const express = require("express");
const Payos = require("@payos/node");
const userModel = require("../../models/user.model");

function generateRandomString(length = 6) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
const ORDERS = {
  products: [],
  userId: null,
  price: null,
  user: [],
  email: null,
  MaDonHang: null,
  paymentLinkCreated: false, // Flag to track if payment link was created
  discount: 0,
  phiShip: 0,
};

const DONNET = {
  MaDonHang: null,
  moneys: 0,
  userId: null,
  status: false,
};

const router = express.Router();
router.use(express.static("public"));
router.use(express.json());

const payos = new Payos(
  "a0c7a8fb-00dc-426c-ba85-41179a28b1df",
  "5f405556-7b3b-4359-a5e9-cc25e4518e99",
  "459703ad94886b85414a4fa4a99f8d77cf8080b4f6d0133c02e6e8d764b61aa7"
);

router.post("/create-payment-link", async (req, res) => {
  const order = {
    amount: Number(req.body.amount),
    description: "2B-flower",
    orderCode: "10",
    items: convertedProducts,
    returnUrl: `http://localhost:3000/information`,
    cancelUrl: `http://localhost:3000/cart`,
  };

  try {
    const paymentLink = await payos.createPaymentLink(order);
    res.json(paymentLink.checkoutUrl);
  } catch (error) {
    console.error("Error creating payment link:", error.message);
    res.status(500).send("Internal server error");
  }
});

router.post("/create-payment-link-donet", async (req, res) => {
  // Set the flag when payment link is created

  const MaDonHang = Math.floor(100000 + Math.random() * 900000);
  DONNET.MaDonHang = MaDonHang;
  DONNET.userId = req.body.userId;

  DONNET.moneys = Number(req.body.amount);
  console.log(req.body);
  const order = {
    amount: Number(req.body.amount),
    description: "Hung - pro",
    orderCode: MaDonHang,
    returnUrl: `http://localhost:3000/pay`,
    cancelUrl: `http://localhost:3000/pay`,
  };

  try {
    const paymentLink = await payos.createPaymentLink(order);
    res.json(paymentLink.checkoutUrl);
  } catch (error) {
    console.error("Error creating payment link:", error.message);
    res.status(500).send("Internal server error");
  }
});

router.get("/statusDonet", async (req, res) => {
  try {
    if (DONNET.MaDonHang == null) {
      return;
    }
    const order = await payos.getPaymentLinkInformation(DONNET.MaDonHang);

    if (!order) {
      return res.json({
        error: -1,
        message: "Failed to fetch order information",
        data: null,
      });
    }

    if (order?.status === "PAID" && DONNET.MaDonHang !== null) {
      const user = await userModel.findOne({ _id: DONNET.userId });

      if (user) {
        const currentMoney = user.moneys || 0;

        user.moneys = currentMoney + DONNET.moneys;
        // console.log(userCart)
        DONNET.MaDonHang = null;
        DONNET.moneys = 0;

        return user.save();
      }
    }

    res.json({
      error: 0,
      message: "Success",
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order information:", error.message);
    res.status(500).json({
      error: -1,
      message: "Internal server error",
      data: null,
    });
  }
});

module.exports = router;
