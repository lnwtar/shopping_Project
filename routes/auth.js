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

async function login(email, password) {
    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.status === 'success') {
            // [หัวใจสำคัญ] บันทึกข้อมูล User ลง LocalStorage
            localStorage.setItem('user_session', JSON.stringify(data.user));
            localStorage.setItem('user_id', data.user.id); // เก็บ ID แยกไว้ใช้ง่ายๆ กับ API ตะกร้า

            alert('ยินดีต้อนรับ ' + data.user.username);
            window.location.href = 'main.html'; // กลับหน้าหลัก
        } else {
            alert('ล็อกอินไม่สำเร็จ: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}