const express = require('express');
const pool = require('../db'); 
const router = express.Router();

// 1. ดึงข้อมูลตะกร้า (GET) - เพิ่ม size, color มาแสดง
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const sql = `
            SELECT 
                ci.id as item_id, 
                ci.quantity, 
                ci.size,       -- เพิ่ม
                ci.color,      -- เพิ่ม
                p.name as product_name, 
                p.price, 
                p.image,    
                ci.product_id
            FROM carts c
            JOIN cart_items ci ON c.id = ci.cart_id
            JOIN products p ON ci.product_id = p.id
            WHERE c.user_id = ? AND c.status = 'active'
        `;
        const [rows] = await pool.query(sql, [userId]);
        
        let total = 0;
        let count = 0;
        rows.forEach(item => {
            total += parseFloat(item.price) * item.quantity;
            count += item.quantity;
        });

        res.json({ items: rows, total, count });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'ดึงข้อมูลไม่สำเร็จ' });
    }
});

// 2. เพิ่มสินค้า (POST) - รับ size, color และเช็คซ้ำแบบละเอียด
router.post('/add', async (req, res) => {
    // รับค่า size และ color เพิ่มเข้ามา
    const { userId, productId, quantity, size, color } = req.body;

    try {
        // A. หาตะกร้า
        const [carts] = await pool.query('SELECT id FROM carts WHERE user_id = ? AND status = "active"', [userId]);
        let cartId;
        if (carts.length === 0) {
            const [newCart] = await pool.query('INSERT INTO carts (user_id, status) VALUES (?, "active")', [userId]);
            cartId = newCart.insertId;
        } else {
            cartId = carts[0].id;
        }

        // B. เช็คสินค้าซ้ำ (ต้องเช็คทั้ง Product ID + Size + Color)
        // ถ้าเสื้อลายเดิม แต่คนละไซส์ ถือเป็นคนละรายการ
        const sqlCheck = `SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ? AND size = ? AND color = ?`;
        const [items] = await pool.query(sqlCheck, [cartId, productId, size, color]);

        if (items.length > 0) {
            // มีไซส์นี้สีนี้แล้ว -> บวกเพิ่ม
            const newQty = items[0].quantity + (quantity || 1);
            await pool.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQty, items[0].id]);
        } else {
            // ยังไม่มี -> เพิ่มใหม่ (บันทึก size, color ด้วย)
            const [product] = await pool.query('SELECT price FROM products WHERE id = ?', [productId]);
            const price = product[0].price;

            const sqlInsert = `INSERT INTO cart_items (cart_id, product_id, quantity, unit_price, size, color) VALUES (?, ?, ?, ?, ?, ?)`;
            await pool.query(sqlInsert, [cartId, productId, (quantity || 1), price, size, color]);
        }

        res.json({ message: 'เพิ่มสินค้าเรียบร้อย' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'เพิ่มสินค้าไม่สำเร็จ' });
    }
});

// 3. อัปเดต และ 4. ลบ (ใช้โค้ดเดิมได้เลย เพราะอ้างอิงตาม item_id ที่ไม่ซ้ำกันอยู่แล้ว)
router.post('/update', async (req, res) => {
    const { itemId, quantity } = req.body;
    if (quantity < 1) return res.status(400).json({ error: 'จำนวนผิดพลาด' });
    try {
        await pool.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, itemId]);
        res.json({ message: 'อัปเดตเรียบร้อย' });
    } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

router.post('/remove', async (req, res) => {
    const { itemId } = req.body;
    try {
        await pool.query('DELETE FROM cart_items WHERE id = ?', [itemId]);
        res.json({ message: 'ลบเรียบร้อย' });
    } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

module.exports = router;