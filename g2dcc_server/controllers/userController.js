const fs = require("fs");
const pool = require("../config/db");
const { validate: isUUID } = require("uuid"); // Import hàm kiểm tra UUID
const cloudinary = require("../utils/cloudinary");

// Lấy thông tin tài khoản
const getProfile = async (req, res) => {
  try {
    const user = await pool.query(
      `
      SELECT 
        users.*, 
        roles.name AS role_name
      FROM users
      JOIN roles ON users.role_id = roles.id
      WHERE users.id = $1
    `,
      [req.user.id]
    );
    if (user.rows.length === 0) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    res.json(user.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllUser = async (req, res) => {
  try {
    const users = await pool.query(`
      SELECT 
        users.*, 
        roles.name AS role_name
      FROM users
      JOIN roles ON users.role_id = roles.id
    `);
    res.json(users.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, active, address, phone, sex } = req.body;
    // 🔴 Kiểm tra ID có hợp lệ không (UUID)
    if (!id || !isUUID(id)) {
      return res.status(400).json({ error: "ID không hợp lệ" });
    }

    const userCheck = await pool.query("SELECT * FROM users WHERE id = $1", [
      id,
    ]);
    if (userCheck.rows.length === 0)
      return res.status(404).json({ error: "User không tồn tại!" });
    // 🛠 Chuẩn bị cập nhật chỉ các trường có trong req.body
    const fields = [];
    const values = [];
    let index = 1;

    // upload ảnh nếu có
    let imgUrl = null;
    if (req.file) {
      imgUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "user_avatars" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        stream.end(req.file.buffer);
      });
    }
    if (username !== undefined) {
      fields.push(`username = $${index}`);
      values.push(username);
      index++;
    }
    if (email !== undefined) {
      fields.push(`email = $${index}`);
      values.push(email);
      index++;
    }
    if (role !== undefined) {
      const roleResult = await pool.query(
        "SELECT id FROM roles WHERE name = $1",
        [role]
      );
      if (roleResult.rows.length === 0) {
        return res.status(400).json({ message: "Role không hợp lệ" });
      }
      fields.push(`role_id = $${index}`);
      values.push(roleResult.rows[0].id);
      index++;
    }
    if (active !== undefined) {
      fields.push(`active = $${index}`);
      values.push(active);
      index++;
    }
    if (address !== undefined) {
      fields.push(`address = $${index}`);
      values.push(address);
      index++;
    }
    if (phone !== undefined) {
      fields.push(`phone = $${index}`);
      values.push(phone);
      index++;
    }
    if (sex !== undefined) {
      fields.push(`sex = $${index}`);
      values.push(sex);
      index++;
    }
    if (imgUrl !== null) {
      fields.push(`img = $${index}`);
      values.push(imgUrl);
      index++;
    }
    // Nếu không có gì để cập nhật
    if (fields.length === 0) {
      return res.status(400).json({ error: "Không có dữ liệu để cập nhật" });
    }
    fields.push(`updated_at = NOW()`);
    const query = `
      UPDATE users 
      SET ${fields.join(", ")}
      WHERE id = $${index}
      RETURNING *;
    `;
    values.push(id);
    const updatedUser = await pool.query(query, values);

    res.json({ message: "Cập nhật thành công", user: updatedUser.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserStats = async (req, res) => {
  try {
    const total = await pool.query("SELECT COUNT(*) FROM users");
    const admin = await pool.query(
      "SELECT COUNT(*) FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'admin')"
    );
    const staff = await pool.query(
      "SELECT COUNT(*) FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'staff')"
    );
    const customer = await pool.query(
      "SELECT COUNT(*) FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'customer')"
    );
    const active = await pool.query(
      "SELECT COUNT(*) FROM users WHERE active = true"
    );
    const inactive = await pool.query(
      "SELECT COUNT(*) FROM users WHERE active = false"
    );
    const registeredPerMonth = await pool.query(`
      SELECT TO_CHAR(created_at, 'YYYY-MM') AS month, COUNT(*) 
      FROM users 
      GROUP BY month 
      ORDER BY month
    `);

    res.json({
      totalUsers: Number(total.rows[0].count),
      adminCount: Number(admin.rows[0].count),
      staffCount: Number(staff.rows[0].count),
      customerCount: Number(customer.rows[0].count),
      activeCount: Number(active.rows[0].count),
      inactiveCount: Number(inactive.rows[0].count),
      registrationsByMonth: registeredPerMonth.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getProfile, getAllUser, updateUser, getUserStats };
