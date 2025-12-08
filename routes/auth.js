const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db'); // db.js เชื่อม MySQL
const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  if (rows.length === 0) return res.status(400).json({ error: 'อีเมลไม่ถูกต้อง' });

  const user = rows[0];
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) return res.status(400).json({ error: 'รหัสผ่านไม่ถูกต้อง' });

  res.json({ message: 'เข้าสู่ระบบสำเร็จ', user: { id: user.id, username: user.username } });
});

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  if (rows.length > 0) return res.status(400).json({ error: 'อีเมลนี้ถูกใช้แล้ว' });

  const hash = await bcrypt.hash(password, 10);
  await pool.query('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)', [username, email, hash]);

  res.json({ message: 'สมัครสมาชิกสำเร็จ' });
});

module.exports = router;

