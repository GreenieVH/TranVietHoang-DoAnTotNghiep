const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviews");
const authMiddleware = require("../middlewares/authMiddleware");

// Public routes
router.get("/product/:productId", reviewController.getProductReviews);

// Protected routes
router.post("/", authMiddleware, reviewController.createReview);
router.get("/user", authMiddleware, reviewController.getUserReviews);
router.put("/:reviewId", authMiddleware, reviewController.updateReview);
router.delete("/:reviewId", authMiddleware, reviewController.deleteReview);

module.exports = router;
