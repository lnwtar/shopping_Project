const express = require('express');
const pool = require('./db');
const path = require('path');
const cors = require('cors'); 
const app = express();
const PORT = Number(process.env.PORT || 3000);

// 1. Middleware (สำคัญมาก)
app.use(cors()); 
app.use(express.json()); 
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// 2. Import Routes
const authRoutes = require('./routes/auth');
// [จุดสำคัญ] ต้องมีไฟล์นี้ใน routes/ และ import เข้ามา
const cartRoutes = require('./routes/cart');   
const orderRoutes = require('./routes/orders'); 
const sellerRoutes = require('./routes/seller');

// 3. ใช้งาน Routes
app.use('/auth', authRoutes);   
app.use('/cart', cartRoutes);   
app.use('/orders', orderRoutes); 
app.use('/seller', sellerRoutes);

app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ status: 'ok', database: 'connected' });
    } catch (error) {
        res.status(503).json({ status: 'error', database: 'disconnected' });
    }
});

// 4. Route หน้าแรก
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'main.html'));
});

app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
