const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public')); // เสิร์ฟไฟล์ static เช่น CSS, รูปภาพ

// เมื่อเข้า http://localhost:3000/ ให้ส่ง main.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'main.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
