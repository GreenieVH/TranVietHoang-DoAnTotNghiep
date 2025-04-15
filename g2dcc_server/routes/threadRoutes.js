const express = require("express");

const { getAllThread, createThread, getAllMessageThread, createMessageThread } = require("../controllers/threadController");
const authenticateToken = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/all", getAllThread);
router.get("/all/message", getAllMessageThread);
router.post("/create",authenticateToken, createThread);
router.post("/create/message",authenticateToken, createMessageThread);


module.exports = router;
