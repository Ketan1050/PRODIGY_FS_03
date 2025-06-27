const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { pool } = require('../config/db');

// @route   POST /api/orders
// @desc    Create a new order from cart
// @access  Private
router.post('/', auth, async (req, res) => {
    const { shipping_address } = req.body; // You might want to get more address details
    let connection;

    try {
        connection = await pool.getConnection();
        await connection.beginTransaction(); // Start a transaction

        // Get user's cart items
        const [cartItems] = await connection.execute(
            `SELECT ci.product_id, ci.quantity, p.price, p.stock_quantity, p.name
             FROM cart_items ci
             JOIN products p ON ci.product_id = p.id
             WHERE ci.user_id = ?`,
            [req.user.id]
        );

        if (cartItems.length === 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'Cart is empty, cannot create order' });
        }

        let totalAmount = 0;
        const orderProducts = [];

        // Check stock and calculate total
        for (const item of cartItems) {
            if (item.stock_quantity < item.quantity) {
                await connection.rollback();
                return res.status(400).json({ message: `Not enough stock for ${item.name}. Available: ${item.stock_quantity}` });
            }
            totalAmount += item.price * item.quantity;
            orderProducts.push(item);
        }

        // Create the order
        const [orderResult] = await connection.execute(
            'INSERT INTO orders (user_id, total_amount, shipping_address) VALUES (?, ?, ?)',
            [req.user.id, totalAmount, shipping_address || 'Default Address'] // Provide a default or handle missing
        );
        const orderId = orderResult.insertId;

        // Add items to order_items table and update product stock
        for (const item of orderProducts) {
            await connection.execute(
                'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, item.price]
            );
            await connection.execute(
                'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
                [item.quantity, item.product_id]
            );
        }

        // Clear user's cart
        await connection.execute('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);

        await connection.commit(); // Commit the transaction
        res.status(201).json({ message: 'Order created successfully', orderId, totalAmount });

    } catch (err) {
        await connection.rollback(); // Rollback on error
        console.error('Error creating order:', err.message);
        res.status(500).send('Server Error');
    } finally {
        if (connection) connection.release();
    }
});

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', auth, async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [orders] = await connection.execute(
            'SELECT id, total_amount, status, order_date, shipping_address FROM orders WHERE user_id = ? ORDER BY order_date DESC',
            [req.user.id]
        );

        // For each order, fetch its items
        for (const order of orders) {
            const [items] = await connection.execute(
                `SELECT oi.quantity, oi.price_at_purchase, p.name, p.image_url, p.id as product_id
                 FROM order_items oi
                 JOIN products p ON oi.product_id = p.id
                 WHERE oi.order_id = ?`,
                [order.id]
            );
            order.items = items;
        }

        res.json(orders);
    } catch (err) {
        console.error('Error fetching orders:', err.message);
        res.status(500).send('Server Error');
    } finally {
        if (connection) connection.release();
    }
});

// @route   GET /api/orders/:id
// @desc    Get a specific order by ID (for logged-in user)
// @access  Private
router.get('/:id', auth, async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [orders] = await connection.execute(
            'SELECT id, total_amount, status, order_date, shipping_address FROM orders WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );

        if (orders.length === 0) {
            return res.status(404).json({ message: 'Order not found or does not belong to user' });
        }

        const order = orders[0];
        const [items] = await connection.execute(
            `SELECT oi.quantity, oi.price_at_purchase, p.name, p.image_url, p.id as product_id
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = ?`,
            [order.id]
        );
        order.items = items;

        res.json(order);
    } catch (err) {
        console.error('Error fetching order by ID:', err.message);
        res.status(500).send('Server Error');
    } finally {
        if (connection) connection.release();
    }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Admin only) - Example
// @access  Private (Admin)
router.put('/:id/status', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Admin only' });
    }

    const { status } = req.body; // e.g., 'processing', 'shipped', 'delivered', 'cancelled'
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status provided' });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        const [result] = await connection.execute(
            'UPDATE orders SET status = ? WHERE id = ?',
            [status, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json({ message: `Order ${req.params.id} status updated to ${status}` });
    } catch (err) {
        console.error('Error updating order status:', err.message);
        res.status(500).send('Server Error');
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;