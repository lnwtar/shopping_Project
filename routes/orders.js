const express = require('express');
const pool = require('../db'); 
const router = express.Router();

// POST /orders/place
router.post('/place', async (req, res) => {
    const { userId, items, total, shipping_name, shipping_address, shipping_phone, payment_method } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'ตะกร้าว่างเปล่า' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. สร้าง Order
        const [orderResult] = await connection.query(
            `INSERT INTO orders (buyer_id, total, status, created_at, shipping_name, shipping_address, shipping_phone, payment_method) 
             VALUES (?, ?, 'pending', NOW(), ?, ?, ?, ?)`,
            [userId, total, shipping_name, shipping_address, shipping_phone, payment_method]
        );
        
        const newOrderId = orderResult.insertId;

        // 2. บันทึกสินค้า
        for (const item of items) {
            const sellerId = item.seller_id || 1; // ใส่ค่า default หรือดึงจากสินค้า

            await connection.query(
                `INSERT INTO order_items (order_id, product_id, seller_id, product_name, unit_price, quantity, line_total)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [newOrderId, item.id, sellerId, item.name, item.price, item.qty, (item.price * item.qty)]
            );
        }

        await connection.commit();

        res.json({ 
            status: 'success', 
            message: 'สั่งซื้อสำเร็จ', 
            orderId: newOrderId 
        });

    } catch (err) {
        await connection.rollback();
        console.error("Order Error:", err);
        res.status(500).json({ error: 'บันทึกออเดอร์ไม่สำเร็จ: ' + err.message });
    } finally {
        connection.release();
    }
});

module.exports = router;