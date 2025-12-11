const express = require('express');
const pool = require('./db'); 
const router = express.Router();

// 1. ลงสินค้าใหม่ (POST /seller/product)
router.post('/product', async (req, res) => {
    // รับค่าจากหน้าเว็บ
    const { seller_id, name, description, price, stock, image } = req.body;

    // ตรวจสอบข้อมูลเบื้องต้น
    if (!seller_id || !name || !price) {
        return res.status(400).json({ error: 'ข้อมูลไม่ครบถ้วน (Missing required fields)' });
    }

    try {
       

        // เพิ่มสินค้าลงตาราง products (ไม่ใส่ ID เพราะ Auto Increment)
        const sql = `
            INSERT INTO products (seller_id, name, description, price, stock, image, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;
        
        const [result] = await pool.query(sql, [seller_id, name, description, price, stock, image]);

        res.json({ 
            message: 'ลงสินค้าเรียบร้อยแล้ว',
            productId: result.insertId 
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'ลงสินค้าไม่สำเร็จ: ' + err.message });
    }
});

// 2. ดูสินค้าของฉัน (GET /seller/products/:sellerId)
router.get('/products', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products WHERE seller_id = ? ORDER BY created_at DESC', [req.params.sellerId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'ดึงข้อมูลสินค้าไม่สำเร็จ' });
    }
});

// 3. ดูออเดอร์ที่ลูกค้าสั่งของฉัน (GET /seller/orders/:sellerId)
router.get('/orders', async (req, res) => {
    try {
        const sql = `
            SELECT 
                oi.id as item_id,
                oi.order_id,
                oi.product_name,
                oi.quantity,
                oi.unit_price,
                oi.line_total,
                oi.size,     -- (ถ้ามีคอลัมน์นี้)
                oi.color,    -- (ถ้ามีคอลัมน์นี้)
                o.status as order_status,
                o.created_at,
                o.shipping_name,
                o.shipping_address,
                u.username as buyer_name,
                u.email as buyer_email
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            JOIN users u ON o.buyer_id = u.id
            WHERE oi.seller_id = ?
            ORDER BY o.created_at DESC
        `;
        const [rows] = await pool.query(sql, [req.params.sellerId]);
        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'ดึงข้อมูลออเดอร์ไม่สำเร็จ' });
    }
});

module.exports = router; 