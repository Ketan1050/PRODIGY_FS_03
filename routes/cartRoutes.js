const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { pool } = require('../config/db');

// @route   GET /api/cart
// @desc    Get user's cart items
// @access  Private
router.get('/', auth, async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [cartItems] = await connection.execute(
            `SELECT ci.id AS cart_item_id, p.id AS product_id, p.name, p.description, p.price, p.image_url, ci.quantity
             FROM cart_items ci
             JOIN products p ON ci.product_id = p.id
             WHERE ci.user_id = ?`,
            [req.user.id]
        );
        res.json(cartItems);
    } catch (err) {
        console.error('Error fetching cart items:', err.message);
        res.status(500).send('Server Error');
    } finally {
        if (connection) connection.release();
    }
});

// @route   POST /api/cart
// @desc    Add item to cart or update quantity
// @access  Private
router.post('/', auth, async (req, res) => {
    const { productId, quantity } = req.body;
    let connection;

    try {
        connection = await pool.getConnection();
        // Check if product exists
        const [products] = await connection.execute('SELECT id, stock_quantity FROM products WHERE id = ?', [productId]);
        if (products.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const product = products[0];

        // Check if requested quantity is available
        if (product.stock_quantity < quantity) {
            return res.status(400).json({ message: `Not enough stock for ${product.name}. Available: ${product.stock_quantity}` });
        }

        // Check if item already in cart
        const [existingItem] = await connection.execute(
            'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
            [req.user.id, productId]
        );

        if (existingItem.length > 0) {
            // Update quantity
            const newQuantity = existingItem[0].quantity + quantity;
            if (product.stock_quantity < newQuantity) {
                return res.status(400).json({ message: `Cannot add more. Max stock for ${product.name}: ${product.stock_quantity}` });
            }
            await connection.execute(
                'UPDATE cart_items SET quantity = ? WHERE id = ?',
                [newQuantity, existingItem[0].id]
            );
            res.json({ message: 'Cart item quantity updated', cartItemId: existingItem[0].id, newQuantity });
        } else {
            // Add new item to cart
            const [result] = await connection.execute(
                'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
                [req.user.id, productId, quantity]
            );
            res.status(201).json({ message: 'Product added to cart', cartItemId: result.insertId, productId, quantity });
        }

    } catch (err) {
        console.error('Error adding/updating cart item:', err.message);
        res.status(500).send('Server Error');
    } finally {
        if (connection) connection.release();
    }
});

// @route   DELETE /api/cart/:id
// @desc    Remove item from cart
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [result] = await connection.execute(
            'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cart item not found or does not belong to user' });
        }
        res.json({ message: 'Cart item removed' });
    } catch (err) {
        console.error('Error removing cart item:', err.message);
        res.status(500).send('Server Error');
    } finally {
        if (connection) connection.release();
    }
});

// @route   PUT /api/cart/:id
// @desc    Update quantity of a cart item
// @access  Private
router.put('/:id', auth, async (req, res) => {
    const { quantity } = req.body;
    let connection;

    if (quantity === undefined || quantity < 1) {
        return res.status(400).json({ message: 'Quantity must be a positive number' });
    }

    try {
        connection = await pool.getConnection();

        // Get current cart item and product stock
        const [cartData] = await connection.execute(
            `SELECT ci.quantity, p.stock_quantity, p.name, p.id as product_id
             FROM cart_items ci
             JOIN products p ON ci.product_id = p.id
             WHERE ci.id = ? AND ci.user_id = ?`,
            [req.params.id, req.user.id]
        );

        if (cartData.length === 0) {
            return res.status(404).json({ message: 'Cart item not found or does not belong to user' });
        }
        const currentCartItem = cartData[0];

        if (quantity > currentCartItem.stock_quantity) {
            return res.status(400).json({ message: `Cannot set quantity to ${quantity}. Only ${currentCartItem.stock_quantity} available for ${currentCartItem.name}.` });
        }

        const [result] = await connection.execute(
            'UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?',
            [quantity, req.params.id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cart item not found or does not belong to user' });
        }
        res.json({ message: 'Cart item quantity updated', cartItemId: req.params.id, newQuantity: quantity });
    } catch (err) {
        console.error('Error updating cart item quantity:', err.message);
        res.status(500).send('Server Error');
    } finally {
        if (connection) connection.release();
    }
});


module.exports = router;