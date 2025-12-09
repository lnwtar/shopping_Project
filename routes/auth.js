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

// ... (code เดิมส่วน login/register) ...

// [เพิ่มใหม่] POST /auth/update-profile
router.post('/update-profile', async (req, res) => {
    const { userId, username, avatar } = req.body;

    if (!userId || !username) {
        return res.status(400).json({ error: 'ข้อมูลไม่ครบถ้วน' });
    }

    try {
        // อัปเดตข้อมูลลง SQL
        await pool.query(
            'UPDATE users SET username = ?, avatar = ? WHERE id = ?', 
            [username, avatar, userId]
        );

        // ดึงข้อมูลล่าสุดของผู้ใช้กลับมาเพื่อส่งให้ Frontend อัปเดต Session
        const [updatedUser] = await pool.query(
            'SELECT id, username, email, is_seller, avatar FROM users WHERE id = ?', 
            [userId]
        );

        res.json({ 
            message: 'อัปเดตข้อมูลสำเร็จ', 
            user: updatedUser[0] // ส่งข้อมูลใหม่กลับไป
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'อัปเดตไม่สำเร็จ (ชื่อผู้ใช้อาจซ้ำ)' });
    }
});

module.exports = router;

