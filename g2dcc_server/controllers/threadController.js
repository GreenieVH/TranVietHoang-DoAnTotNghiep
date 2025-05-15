const pool = require("../config/db");
const { validate: isUUID } = require("uuid");
const { uploadToCloudinary } = require("../utils/cloudinary");

const getAllThread = async (req, res) => {
  try {
    const threads = await pool.query(`SELECT 
        ct.*, 
        u.username AS created_by_name, 
        u.img AS created_by_avatar 
      FROM chat_threads ct
      JOIN users u ON ct.created_by = u.id
      ORDER BY ct.is_pinned DESC, ct.created_at DESC`);
    res.json(threads.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllMessageThread = async (req, res) => {
  const params = req.query;
  try {
    const messages = await pool.query(
      `
      SELECT 
        mt.*, 
        u.username AS sender_name, 
        u.img AS sender_avatar 
      FROM message_thread mt
      JOIN users u ON mt.sender_id = u.id
      WHERE mt.thread_id = $1
      ORDER BY mt.created_at ASC
      `,
      [params.thread_id]
    );
    res.json(messages.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createThread = async (req, res) => {
  try {
    const { title, created_by, description, is_pinned } = req.body;
    if (!title || !created_by) {
      return res.status(400).json({ error: "Title là bắt buộc!" });
    }

    // Lấy URL ảnh từ Cloudinary nếu có upload
    let imgUrl = null;
    if (req.file) {
      imgUrl = await uploadToCloudinary(req.file.buffer, "forum/threads");
    }

    const newThread = await pool.query(
      "INSERT INTO chat_threads (title, created_by, description, is_pinned, img) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [title, created_by, description, is_pinned ?? false, imgUrl]
    );
    res.status(201).json(newThread.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createMessageThread = async (req, res) => {
  try {
    const { thread_id, sender_id, content, parent_message_id } = req.body;

    if (!sender_id || !isUUID(sender_id)) {
      return res.status(400).json({ error: "sender_id không hợp lệ!" });
    }
    if (!content || !thread_id || !sender_id) {
      return res
        .status(400)
        .json({ error: "Content, thread_id và sender_id là bắt buộc!" });
    }

    // Lấy URL ảnh từ Cloudinary nếu có upload
    let imgUrl = null;
    if (req.file) {
      imgUrl = await uploadToCloudinary(req.file.buffer, "forum/messages");
    }

    const newMessage = await pool.query(
      `INSERT INTO message_thread (thread_id, sender_id, content, parent_message_id, img) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [thread_id, sender_id, content, parent_message_id || null, imgUrl]
    );

    res.status(201).json(newMessage.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteThread = async (req, res) => {
  try {
    const { id } = req.params;

    // Xóa tất cả message trong thread trước
    await pool.query("DELETE FROM message_thread WHERE thread_id = $1", [id]);

    // Sau đó xóa thread
    const result = await pool.query(
      "DELETE FROM chat_threads WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Thread không tồn tại!" });
    }

    res.json({ message: "Xóa thread thành công!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM message_thread WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Message không tồn tại!" });
    }

    res.json({ message: "Xóa message thành công!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateThread = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, tags } = req.body;

    // Kiểm tra thread tồn tại
    const thread = await pool.query(
      "SELECT * FROM chat_threads WHERE id = $1",
      [id]
    );

    if (thread.rows.length === 0) {
      return res.status(404).json({ error: "Thread không tồn tại" });
    }

    // Xử lý upload ảnh nếu có
    let imgUrl = thread.rows[0].img; // Giữ ảnh cũ nếu không upload mới
    if (req.file) {
      imgUrl = await uploadToCloudinary(req.file.buffer, "forum/threads");
    }

    // Cập nhật thread
    const updateQuery = `
      UPDATE chat_threads 
      SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        tags = COALESCE($3, tags),
        img = COALESCE($4, img)
      WHERE id = $5
      RETURNING *
    `;

    const values = [
      title || null,
      description || null,
      tags ? JSON.stringify(tags) : null,
      imgUrl,
      id
    ];

    const result = await pool.query(updateQuery, values);

    res.json({
      message: "Cập nhật thread thành công",
      thread: result.rows[0]
    });
  } catch (error) {
    console.error("Error updating thread:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
};

const updateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    // Kiểm tra message tồn tại
    const messageExists = await pool.query(
      "SELECT * FROM message_thread WHERE id = $1",
      [id]
    );

    if (messageExists.rows.length === 0) {
      return res.status(404).json({ error: "Message không tồn tại!" });
    }

    // Xử lý upload ảnh nếu có
    let imgUrl = messageExists.rows[0].img; // Giữ ảnh cũ nếu không upload mới
    if (req.file) {
      imgUrl = await uploadToCloudinary(req.file.buffer, "forum/messages");
    }

    // Cập nhật message
    const updatedMessage = await pool.query(
      `UPDATE message_thread 
       SET content = COALESCE($1, content),
           img = COALESCE($2, img),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [content, imgUrl, id]
    );

    res.json(updatedMessage.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllThread,
  getAllMessageThread,
  createThread,
  createMessageThread,
  deleteThread,
  deleteMessage,
  updateThread,
  updateMessage
};
