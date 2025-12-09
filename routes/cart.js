const express = require('express');
const pool = require('../db'); // เชื่อมต่อ Database
const router = express.Router();

// 1. ดึงข้อมูลตะกร้า (GET /cart/:userId)
router.get('/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const sql = `
            SELECT ci.id as item_id, ci.quantity, ci.size, ci.color,
                   p.name as product_name, p.price, p.image, ci.product_id
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
        res.status(500).json({ error: err.message });
    }
});

// 2. เพิ่มสินค้า (POST /cart/add)
router.post('/add', async (req, res) => {
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

        // B. เช็คสินค้าซ้ำ
        const sqlCheck = `SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ? AND size = ? AND color = ?`;
        const [items] = await pool.query(sqlCheck, [cartId, productId, size, color]);

        if (items.length > 0) {
            const newQty = items[0].quantity + (quantity || 1);
            await pool.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQty, items[0].id]);
        } else {
            // ดึงราคา
            const [product] = await pool.query('SELECT price FROM products WHERE id = ?', [productId]);
            if (product.length === 0) return res.status(404).json({ error: 'Product not found' });
            const price = product[0].price;

            await pool.query(
                `INSERT INTO cart_items (cart_id, product_id, quantity, unit_price, size, color) VALUES (?, ?, ?, ?, ?, ?)`,
                [cartId, productId, quantity || 1, price, size, color]
            );
        }
        res.json({ message: 'Added to cart' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. อัปเดตและลบ
router.post('/update', async (req, res) => {
    const { itemId, quantity } = req.body;
    try {
        await pool.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, itemId]);
        res.json({ message: 'Updated' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/remove', async (req, res) => {
    const { itemId } = req.body;
    try {
        await pool.query('DELETE FROM cart_items WHERE id = ?', [itemId]);
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;