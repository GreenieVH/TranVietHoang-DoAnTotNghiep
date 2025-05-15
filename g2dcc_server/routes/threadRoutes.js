const express = require("express");

const { getAllThread, createThread, getAllMessageThread, createMessageThread, updateThread, updateMessage, deleteThread, deleteMessage } = require("../controllers/threadController");
const authenticateToken = require("../middlewares/authMiddleware");
const { uploadThreadImageMiddleware } = require("../middlewares/uploadMiddleware");
const { uploadMessageImageMiddleware } = require("../middlewares/uploadMiddleware");
const router = express.Router();

router.get("/all", getAllThread);
router.get("/all/message", getAllMessageThread);
router.post("/create",authenticateToken, uploadThreadImageMiddleware, createThread);
router.post("/create/message",authenticateToken, uploadMessageImageMiddleware, createMessageThread);
router.put("/update/thread/:id",authenticateToken, uploadThreadImageMiddleware, updateThread);
router.put("/update/message/:id",authenticateToken, uploadMessageImageMiddleware, updateMessage);
router.delete("/delete/thread/:id",authenticateToken, deleteThread);
router.delete("/delete/message/:id",authenticateToken, deleteMessage);


module.exports = router;
