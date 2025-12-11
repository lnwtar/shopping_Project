const express = require('express');
const pool = require('../db'); 
const router = express.Router();

// 1. ลงสินค้าใหม่ (ใครๆ ก็ลงได้ แค่ล็อกอินแล้ว)
router.post('/product', async (req, res) => {
    const { seller_id, name, description, price, stock, image } = req.body;

    if (!seller_id || !name || !price) {
        return res.status(400).json({ error: 'ข้อมูลไม่ครบถ้วน' });
    }

    try {
        // [ลบส่วนนี้ออก] ไม่ต้องเช็ค is_seller แล้ว
        /*
        const [user] = await pool.query('SELECT is_seller FROM users WHERE id = ?', [seller_id]);
        if (user.length === 0 || user[0].is_seller !== 1) { ... }
        */

        // เพิ่มสินค้า
        const sql = `
            INSERT INTO products (seller_id, name, description, price, stock, image, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;
        const [result] = await pool.query(sql, [seller_id, name, description, price, stock, image]);

        res.json({ message: 'ลงสินค้าเรียบร้อยแล้ว', productId: result.insertId });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'ลงสินค้าไม่สำเร็จ: ' + err.message });
    }
});

// 2. ดูสินค้าของฉัน (My Products)
router.get('/products/:sellerId', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products WHERE seller_id = ? ORDER BY created_at DESC', [req.params.sellerId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'ดึงข้อมูลสินค้าไม่สำเร็จ' });
    }
});

// 3. ดูสินค้า **ทั้งหมด** (All Products) สำหรับหน้า Main
// [เพิ่มใหม่] เพื่อให้หน้า Main ดึงสินค้าของทุกคนมาโชว์
router.get('/all', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'ดึงข้อมูลสินค้าทั้งหมดไม่สำเร็จ' });
    }
});

// 4. ดูออเดอร์ที่ลูกค้าสั่งของฉัน (My Sales)
router.get('/orders/:sellerId', async (req, res) => {
    try {
        const sql = `
            SELECT 
                oi.*, 
                o.status as order_status, o.created_at, o.shipping_name, o.shipping_address,
                u.username as buyer_name
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            JOIN users u ON o.buyer_id = u.id
            WHERE oi.seller_id = ?
            ORDER BY o.created_at DESC
        `;
        const [rows] = await pool.query(sql, [req.params.sellerId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching orders' });
    }
});

module.exports = router;