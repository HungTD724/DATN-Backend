const { SuccessResponse, CREATED } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {
  handleRefreshToken = async (req, res, next) => {
    new SuccessResponse({
      message: "Get token success",
      metadata: await AccessService.handleRefreshToken({
        refreshToken: req.refreshToken,
        user: req.user,
        keyStore: req.keyStore,
      }),
    }).send(res);
  };

  logout = async (req, res, next) => {
    new SuccessResponse({
      message: "Logout success",
      metadata: await AccessService.logout(req.keyStore),
    }).send(res);
  };

  login = async (req, res, next) => {
    new SuccessResponse({
      metadata: await AccessService.login(req.body),
    }).send(res);
  };

  verifyEmail = async (req, res, next) => {
    new SuccessResponse({
      metadata: await AccessService.verifyEmail(req.body),
    }).send(res);
  };

  getUser = async (req, res, next) => {
    new SuccessResponse({
      metadata: await AccessService.getUser(req.params),
    }).send(res);
  };

  getAllUser = async (req, res, next) => {
    new SuccessResponse({
      metadata: await AccessService.getAllUser(req.params),
    }).send(res);
  };

  deductMoney = async (req, res, next) => {
    new SuccessResponse({
      metadata: await AccessService.deductMoney(req.params),
    }).send(res);
  };

  signUp = async (req, res, next) => {
    new CREATED({
      message: "Register success",
      metadata: await AccessService.signUp(req.body),
    }).send(res);
  };

      deleteUser = async (req, res, next) => {
    new SuccessResponse({
      message: "handleAuction",
      metadata: await AccessService.deleteUser(req.params),
    }).send(res);
  };
}

module.exports = new AccessController();
