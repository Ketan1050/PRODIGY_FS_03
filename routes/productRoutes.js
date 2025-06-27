const express = require('express');
const router = express.Router();
const { pool } = require('../config/db'); // Import the MySQL connection pool
const auth = require('../middleware/authMiddleware'); // For protected admin routes

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get('/', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection(); // Get a connection from the pool
        const [rows] = await connection.execute('SELECT * FROM products');
        res.json(rows);
    } catch (err) {
        console.error('Error fetching products:', err.message);
        res.status(500).send('Server Error');
    } finally {
        if (connection) connection.release(); // Always release the connection
    }
});

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(rows[0]); // Return the first (and only) row
    } catch (err) {
        console.error('Error fetching product by ID:', err.message);
        // MySQL typically won't throw a 'bad ID format' error like MongoDB's ObjectId,
        // but invalid input could result in a general SQL error or no rows found.
        res.status(500).send('Server Error');
    } finally {
        if (connection) connection.release();
    }
});

// @route   POST /api/products
// @desc    Add a new product (Admin only)
// @access  Private (Admin)
router.post('/', auth, async (req, res) => {
    // Implement admin role check
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Admin only' });
    }

    const { name, description, price, image_url, category, stock_quantity } = req.body;
    let connection;

    try {
        connection = await pool.getConnection();
        const [result] = await connection.execute(
            'INSERT INTO products (name, description, price, image_url, category, stock_quantity) VALUES (?, ?, ?, ?, ?, ?)',
            [name, description, price, image_url, category, stock_quantity]
        );
        res.status(201).json({ id: result.insertId, name, description, price, image_url, category, stock_quantity });
    } catch (err) {
        console.error('Error adding product:', err.message);
        res.status(500).send('Server Error');
    } finally {
        if (connection) connection.release();
    }
});

// @route   PUT /api/products/:id
// @desc    Update a product (Admin only)
// @access  Private (Admin)
router.put('/:id', auth, async (req, res) => {
    // Implement admin role check
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Admin only' });
    }

    const { name, description, price, image_url, category, stock_quantity } = req.body;
    let connection;

    try {
        connection = await pool.getConnection();
        const [result] = await connection.execute(
            'UPDATE products SET name = ?, description = ?, price = ?, image_url = ?, category = ?, stock_quantity = ? WHERE id = ?',
            [name, description, price, image_url, category, stock_quantity, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product updated successfully' });
    } catch (err) {
        console.error('Error updating product:', err.message);
        res.status(500).send('Server Error');
    } finally {
        if (connection) connection.release();
    }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product (Admin only)
// @access  Private (Admin)
router.delete('/:id', auth, async (req, res) => {
    // Implement admin role check
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Admin only' });
    }

    let connection;

    try {
        connection = await pool.getConnection();
        const [result] = await connection.execute('DELETE FROM products WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error('Error deleting product:', err.message);
        // Handle foreign key constraint error if product is part of an order
        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
             return res.status(409).json({ message: 'Cannot delete product: It is referenced by an order.' });
        }
        res.status(500).send('Server Error');
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;