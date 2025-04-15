const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const pool = require("../config/db"); // Giả sử bạn đã có đối tượng db từ Sequelize

const REFRESH_KEY = process.env.REFRESH_TOKEN_SECRET;

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleAuthController = async (req, res) => {
  try {
    const { token } = req.body;

    // Verify token từ Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, // Mã client ID của bạn
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Kiểm tra xem người dùng đã tồn tại chưa trong cơ sở dữ liệu PostgreSQL
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    let user = result.rows[0];

    // Nếu chưa có user, tạo mới
    if (!user) {
      const insertResult = await pool.query(
        "INSERT INTO users (email, username, img, password) VALUES ($1, $2, $3, $4) RETURNING *",
        [email, name, picture, ''] // Không cần mật khẩu khi đăng nhập qua Google
      );
      user = insertResult.rows[0];
    }
    // Tạo refreshToken
    const refreshToken = jwt.sign({ id: user.id, email }, REFRESH_KEY, {
        expiresIn: "15d",
      });
    // Lưu refreshToken vào CSDL
    await pool.query("UPDATE users SET refresh_token = $1 WHERE id = $2", [
        refreshToken,
        user.id,
      ]);

    // Tạo JWT cho người dùng sau khi đăng nhập thành công
    const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "10d",
    });

    // 🔥 Lưu refreshToken vào HttpOnly Cookie
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true, // Ngăn JavaScript truy cập
        secure: true, // Bật khi dùng HTTPS
        sameSite: "None", // Hỗ trợ CORS
        maxAge: 15 * 24 * 60 * 60 * 1000, // 15 ngày
      });

    // Trả về thông tin người dùng và accessToken
    return res.json({
      message: "Đăng nhập thành công",
      accessToken
    });
  } catch (error) {
    console.error("Google auth error:", error);
    return res
      .status(500)
      .json({ error: "Đã xảy ra lỗi khi đăng nhập qua Google." });
  }
};

module.exports = googleAuthController;
