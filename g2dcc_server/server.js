require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const threadRoutes = require("./routes/threadRoutes");
const productsRoutes = require("./routes/productsRoutes");
const categoryRoutes = require("./routes/categoriesRoutes");
const cartRoutes = require("./routes/cartRoutes");
const reviewsRoutes = require("./routes/reviewsRoutes");
const ordersRoutes = require("./routes/ordersRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const promotionsRoutes = require("./routes/promotionsRoutes");
const bannersRoutes = require("./routes/bannersRoutes");
const importsRoutes = require("./routes/importsRoutes");
const addressesRoutes = require("./routes/addressesRoutes");
const suppliersRoutes = require("./routes/suppliersRoutes");
const brandsRoutes = require("./routes/brandsRoutes");
const productVariantRoutes = require("./routes/productVariantRoutes");
const searchRoutes = require("./routes/searchRoutes");

const cookieParser = require("cookie-parser");
const http = require("http");
const pool = require("./config/db");
const { Server } = require("socket.io");

const app = express();
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true,
  })
);
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use("/test", (req, res) => {
  res.send("Đây là trang test");
});
app.use("/uploads", express.static("uploads"));
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/threads", threadRoutes);
app.use("/products", productsRoutes);
app.use("/categories", categoryRoutes);
app.use("/cart", cartRoutes);
app.use("/reviews", reviewsRoutes);
app.use("/orders", ordersRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/promotions", promotionsRoutes);
app.use("/banners", bannersRoutes);
app.use("/imports", importsRoutes);
app.use("/addresses", addressesRoutes);
app.use("/suppliers", suppliersRoutes);
app.use("/brands", brandsRoutes);
app.use("/variants", productVariantRoutes);
app.use("/search", searchRoutes);

// Socket.io xử lý tin nhắn
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("sendMessage", async (data) => {
    const { thread_id, sender_id, content, parent_message_id } = data;

    if (!sender_id || !content || !thread_id) {
      return;
    }

    try {
      const newMessage = await pool.query(
        `INSERT INTO message_thread (thread_id, sender_id, content, parent_message_id) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [thread_id, sender_id, content, parent_message_id || null]
      );

      const savedMessage = newMessage.rows[0];
      // Lấy thông tin user
      const user = await pool.query(
        `SELECT username AS sender_name, img AS sender_avatar FROM users WHERE id = $1`,
        [sender_id]
      );

      const senderInfo = user.rows[0] || {
        sender_name: "Unknown",
        sender_avatar: null,
      };

      // Gửi tin nhắn mới với đầy đủ thông tin user
      io.to(thread_id).emit("messageAdded", {
        ...savedMessage,
        sender_name: senderInfo.sender_name,
        sender_avatar: senderInfo.sender_avatar,
      });
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
    }
  });

  socket.on("joinThread", (thread_id) => {
    socket.join(thread_id);
    console.log(`User joined thread ${thread_id}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(4000, () => {
  console.log("Chạy server trên cổng 4000");
});
