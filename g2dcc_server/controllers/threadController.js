const pool = require("../config/db");
const { validate: isUUID } = require("uuid");

const getAllThread = async (req, res) => {
  try {
    const threads = await pool.query(`SELECT 
        ct.*, 
        u.username AS created_by_name, 
        u.img AS created_by_avatar 
      FROM chat_threads ct
      JOIN users u ON ct.created_by = u.id`);
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
    const { title, created_by,description, is_pinned } = req.body;
    if (!title || !created_by) {
      return res.status(400).json({ error: "Title là bắt buộc!" });
    }
    const newThread = await pool.query(
      "INSERT INTO chat_threads (title, created_by,description, is_pinned) VALUES ($1,$2,$3,$4) RETURNING *",
      [title, created_by,description, is_pinned ?? false]
    );
    res.status(201).json(newThread.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createMessageThread = async (req, res) => {
  try {
    const { thread_id, sender_id, content, parent_message_id } = req.body;
    console.log({
      thread_id,
      sender_id,
      content,
      parent_message_id,
    });
    const filePath = req.file ? `/uploads/messages/${req.file.filename}` : null;

    if (!sender_id || !isUUID(sender_id)) {
      return res.status(400).json({ error: "sender_id không hợp lệ!" });
    }
    if (!content || !thread_id || !sender_id) {
      return res
        .status(400)
        .json({ error: "Content, thread_id và sender_id là bắt buộc!" });
    }

    const newMessage = await pool.query(
      `INSERT INTO message_thread (thread_id, sender_id, content, parent_message_id, attachment_path) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [thread_id, sender_id, content, parent_message_id || null, filePath]
    );

    res.status(201).json(newMessage.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllThread,
  getAllMessageThread,
  createThread,
  createMessageThread,
};
