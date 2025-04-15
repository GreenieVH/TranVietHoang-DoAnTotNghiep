const express = require("express");
const { register, login, refreshToken, logout } = require("../controllers/authController");
const googleAuthController = require("../controllers/googleAuthController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google-login", googleAuthController);
router.post("/token", refreshToken);
router.post("/logout", logout);

module.exports = router;
