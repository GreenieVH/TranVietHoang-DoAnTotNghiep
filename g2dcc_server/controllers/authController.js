const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_KEY = process.env.REFRESH_TOKEN_SECRET;

function generateAccessToken(user) {
  return jwt.sign(user, SECRET_KEY, { expiresIn: "10d" });
}

// Đăng ký tài khoản
const register = async (req, res) => {
  const { username, password, email } = req.body;
  // Kiểm tra input
  if (!username || !password || !email) {
    return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
  }
  try {
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE username = $1 OR email = $2",
      [username, email]
    );
    if (existingUser.rows.length > 0)
      return res
        .status(400)
        .json({ message: "Username hoặc Email đã tồn tại!" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (username, password, email) VALUES ($1, $2, $3)",
      [username, hashedPassword, email]
    );

    res.status(201).json({ message: "Đăng ký thành công" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Đăng nhập
const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await pool.query(`
      SELECT u.*, r.name as role_name 
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.username = $1
    `, [username]);

    if (user.rows.length === 0)
      return res.status(400).json({ message: "Sai tài khoản hoặc mật khẩu!" });

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword)
      return res.status(400).json({ message: "Sai tài khoản hoặc mật khẩu!" });
    if (!user.rows[0].active)
      return res
        .status(400)
        .json({ message: "Tài khoản của bạn đang bị khóa!" });

    // Include role in the token
    const accessToken = generateAccessToken({ 
      id: user.rows[0].id, 
      username: user.rows[0].username,
      role: user.rows[0].role_name 
    });
    
    const refreshToken = jwt.sign(
      { 
        id: user.rows[0].id, 
        username: user.rows[0].username, 
        role: user.rows[0].role_name 
      },
      REFRESH_KEY,
      { expiresIn: "15d" }
    );

    await pool.query("UPDATE users SET refresh_token = $1 WHERE id = $2", [
      refreshToken,
      user.rows[0].id,
    ]);
    
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });
    
    res.status(201).json({ 
      accessToken, 
      message: "Đăng nhập thành công",
      user: {
        id: user.rows[0].id,
        username: user.rows[0].username,
        role: user.rows[0].role_name
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cấp lại Access Token từ Refresh Token
const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(401);

  try {
    // Verify refresh token
    const decoded = jwt.verify(token, REFRESH_KEY);
    
    // Kiểm tra token trong database
    const user = await pool.query(
      "SELECT * FROM users WHERE id = $1 AND refresh_token = $2",
      [decoded.id, token]
    );

    if (user.rows.length === 0) {
      // Token không tồn tại trong database => có thể đã bị đánh cắp
      await pool.query(
        "UPDATE users SET refresh_token = NULL WHERE id = $1",
        [decoded.id]
      );
      return res.sendStatus(403);
    }

    // Tạo access token mới
    const accessToken = generateAccessToken({
      id: user.rows[0].id,
      username: user.rows[0].username,
      role: user.rows[0].role_name
    });

    // Tạo refresh token mới
    const newRefreshToken = jwt.sign(
      { 
        id: user.rows[0].id, 
        username: user.rows[0].username,
        role: user.rows[0].role_name
      },
      REFRESH_KEY,
      { expiresIn: "15d" }
    );

    // Cập nhật refresh token mới vào database
    await pool.query(
      "UPDATE users SET refresh_token = $1 WHERE id = $2",
      [newRefreshToken, user.rows[0].id]
    );

    // Set cookie mới
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      // Token đã hết hạn => xóa refresh token
      const decoded = jwt.decode(token);
      if (decoded?.id) {
        await pool.query(
          "UPDATE users SET refresh_token = NULL WHERE id = $1",
          [decoded.id]
        );
      }
      return res.sendStatus(401);
    }
    return res.sendStatus(403);
  }
};

// Đăng xuất
const logout = async (req, res) => {
  if (!req.cookies || !req.cookies.refreshToken) {
    return res.sendStatus(401); // Không có cookie => Unauthorized
  }

  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(204);
  await pool.query(
    "UPDATE users SET refresh_token = NULL WHERE refresh_token = $1",
    [refreshToken]
  );
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });
  res.sendStatus(204);
};

module.exports = { register, login, refreshToken, logout };
