const express = require('express');
const pool = require('./db');
const path = require('path');
const cors = require('cors'); 
const app = express();
const PORT = 3000;

// 1. Middleware (สำคัญมาก)
app.use(cors()); 
app.use(express.json()); 
app.use(express.static('public')); 
app.use('/public', express.static('public')); 

// 2. Import Routes
const authRoutes = require('./routes/auth');
// [จุดสำคัญ] ต้องมีไฟล์นี้ใน routes/ และ import เข้ามา
const cartRoutes = require('./routes/cart');   
const orderRoutes = require('./routes/orders'); 

// 3. ใช้งาน Routes
app.use('/auth', authRoutes);   
app.use('/cart', cartRoutes);   
app.use('/orders', orderRoutes); 

// 4. Route หน้าแรก
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'main.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});