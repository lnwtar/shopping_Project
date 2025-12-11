const express = require('express');
const pool = require('../db');
const router = express.Router();

// 1. สั่งซื้อสินค้า (POST /orders/place)
router.post('/place', async (req, res) => {
    const { userId, items, total, shipping_name, shipping_address, shipping_phone, payment_method } = req.body;

    if (!items || items.length === 0) return res.status(400).json({ error: 'Cart empty' });

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // สร้าง Order
        const [resOrder] = await connection.query(
            `INSERT INTO orders (buyer_id, total, status, created_at, shipping_name, shipping_address, shipping_phone, payment_method) 
             VALUES (?, ?, 'pending', NOW(), ?, ?, ?, ?)`,
            [userId, total, shipping_name, shipping_address, shipping_phone, payment_method]
        );
        const orderId = resOrder.insertId;

        // บันทึกรายการสินค้า
        for (const item of items) {
            await connection.query(
                `INSERT INTO order_items (order_id, product_id, seller_id, product_name, unit_price, quantity, line_total)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [orderId, item.id, 1, item.name, item.price, item.qty, (item.price * item.qty)]
            );
        }

        // เคลียร์ตะกร้าใน DB
        await connection.query('UPDATE carts SET status = "checked_out" WHERE user_id = ? AND status = "active"', [userId]);

        await connection.commit();
        res.json({ status: 'success', orderId: orderId });

    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

// 2. [สำคัญ] ดึงประวัติการสั่งซื้อ (GET /orders/history/:userId)
router.get('/history/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        // ดึงข้อมูลออเดอร์ของผู้ใช้นี้ เรียงจากใหม่ไปเก่า
        const sql = `
            SELECT id, total, status, created_at 
            FROM orders 
            WHERE buyer_id = ? 
            ORDER BY created_at DESC
        `;
        const [orders] = await pool.query(sql, [userId]);

        res.json(orders);

    } catch (err) {
        console.error("History Error:", err);
        res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลได้' });
    }
});

module.exports = router;