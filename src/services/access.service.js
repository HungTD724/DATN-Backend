const crypto = require("node:crypto");
const bcrypt = require("bcrypt");
const USER_MODEL = require("../models/user.model");
const { BadRequestError, NotFoundError, AuthFailureError, ForbiddenError, ConflictRequestError } = require("../core/error.response");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const KeyTokenService = require("./keyToken.service");
const keytokenModel = require("../models/keytoken.model");
const { sendEmail } = require("../utils/postMail");
const emailVerification = require("../models/emailVerification");

class AccessService {
  static handleRefreshToken = async ({ user, keyStore, refreshToken }) => {
    const { userId, email } = user;

    if (keyStore.refreshTokenUsed.includes(refreshToken)) {
      await KeyTokenService.removeKeyById(userId);
      throw new ForbiddenError("Something wrong happend !! Pls relogin");
    }

    if (keyStore.refreshToken !== refreshToken) throw new AuthFailureError("User not register");

    const foundUser = await USER_MODEL.findOne({ email });

    if (!foundUser) throw new AuthFailureError("User not register");

    const tokens = await createTokenPair({ userId: foundUser._id, email }, keyStore.publicKey, keyStore.privateKey);

    await KeyTokenService.createKeyToken({
      userId: foundUser._id,
      privateKey: keyStore.privateKey,
      publicKey: keyStore.publicKey,
      refreshToken: tokens.refreshToken,
    });

    await keytokenModel.updateOne(
      { _id: keyStore._id },
      {
        $set: {
          refreshToken: tokens.refreshToken,
        },
        $addToSet: {
          refreshTokenUsed: refreshToken,
        },
      }
    );

    return {
      user,
      tokens,
    };
  };
  static signUp = async ({
    phoneNumber,
    password,
    fullName,
    birthDate,
    gender,
    email,
    address,
    idNumber,
    idIssueDate,
    idIssuePlace,
    bankAccountNumber,
    bankName,
    bankAccountHolder,
    agree1,
    agree2,
  }) => {
    // Kiểm tra xem email đã được đăng ký chưa
    const holderUser = await USER_MODEL.findOne({ email }).lean();
    if (holderUser) {
      throw new ConflictRequestError("Email already registered");
    }

    // Mã hóa mật khẩu
    const passwordHash = await bcrypt.hash(password, 10);

    // Tạo người dùng mới
    const newUser = await USER_MODEL.create({
      phoneNumber,
      fullName,
      email,
      password: passwordHash,
      birthDate,
      gender,
      address,
      idNumber,
      idIssueDate,
      idIssuePlace,
      bankAccountNumber,
      bankName,
      bankAccountHolder,
      agree1,
      agree2,
    });

    if (newUser) {
      // Tạo mã xác nhận email
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Lưu thông tin xác nhận email
      await emailVerification.create({
        email: newUser.email,
        verificationCode,
      });

      // Gửi email xác nhận
      await sendEmail(email, "Xác Nhận Email Đăng Ký", `Code ${verificationCode}`);

      // Trả về thông báo yêu cầu xác nhận
      return {
        message: "Vui lòng kiểm tra email của bạn để xác nhận.",
      };
    }
  };

  static getUser = async ({ userId }) => {
    const user = await USER_MODEL.findOne({ _id: userId });

    return user;
  };

  static deductMoney = async ({ userId }) => {
    // Tìm người dùng bất đồng bộ
    const user = await USER_MODEL.findOne({ _id: userId });

    // Kiểm tra xem người dùng có tồn tại không
    if (!user) {
      throw new Error("Người dùng không tồn tại.");
    }

    // Trừ 10,000 từ số dư của người dùng
    user.moneys = user.moneys - 10000;

    // Lưu thay đổi vào cơ sở dữ liệu
    return user.save();
  };

  static verifyEmail = async (params, res) => {
    const { code, email } = params;

    // Kiểm tra mã xác nhận
    const verification = await emailVerification.findOne({ email, verificationCode: code });
    if (!verification) {
      return res.status(400).send("Mã xác nhận không hợp lệ hoặc đã hết hạn.");
    }

    // Cập nhật trạng thái xác nhận
    verification.isVerified = true;
    await verification.save();

    // Cập nhật người dùng để đánh dấu email đã xác nhận (tùy chọn)
    await USER_MODEL.updateOne({ email }, { $set: { emailVerified: true } });

    // Lấy thông tin người dùng
    const user = await USER_MODEL.findOne({ email }).lean();

    // Gửi thông báo đăng ký thành công
    return {
      message: "Đăng ký thành công! Bạn đã xác nhận email của mình.",
      user: getInfoData(
        ["_id", "fullName", "email", "phoneNumber", "birthDate", "gender", "address", "idNumber", "bankAccountNumber"],
        user
      ),
    };
  };

  static login = async ({ email, password }) => {
    const foundUser = await USER_MODEL.findOne({ email });

    if (!foundUser) {
      throw new NotFoundError("User not registered");
    }

    const match = await bcrypt.compare(password, foundUser.password);
    if (!match) {
      throw new AuthFailureError("Thông tin tài khoản hoặc mật khẩu không chính xác");
    }

    // tạo token
    const publicKey = crypto.randomBytes(64).toString("hex");
    const privateKey = crypto.randomBytes(64).toString("hex");
    const tokens = await createTokenPair({ userId: foundUser._id, email }, publicKey, privateKey);

    // tạo hoặc cập nhật keytoken cho user
    await KeyTokenService.createKeyToken({
      userId: foundUser._id,
      refreshToken: tokens.refreshToken,
      publicKey,
      privateKey,
    });

    return {
      user: getInfoData(["_id", "fullName", "email"], foundUser),
      tokens,
      status: "success",
    };
  };

  static logout = async (keyStore) => {
    const delKey = await KeyTokenService.removeKeyById(keyStore._id);
    return {
      message: "Logout success",
    };
  };
}

module.exports = AccessService;
