const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { pool } = require('../config/db');

// @route   GET /api/reviews/:productId
// @desc    Get all reviews for a product
// @access  Public
router.get('/:productId', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [reviews] = await connection.execute(
            `SELECT r.id, r.rating, r.comment, r.created_at, u.username
             FROM reviews r
             JOIN users u ON r.user_id = u.id
             WHERE r.product_id = ?
             ORDER BY r.created_at DESC`,
            [req.params.productId]
        );
        res.json(reviews);
    } catch (err) {
        console.error('Error fetching reviews:', err.message);
        res.status(500).send('Server Error');
    } finally {
        if (connection) connection.release();
    }
});

// @route   POST /api/reviews
// @desc    Submit a review for a product
// @access  Private
router.post('/', auth, async (req, res) => {
    const { productId, rating, comment } = req.body;
    let connection;

    if (!productId || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Product ID and a rating (1-5) are required.' });
    }

    try {
        connection = await pool.getConnection();

        // Check if product exists
        const [products] = await connection.execute('SELECT id FROM products WHERE id = ?', [productId]);
        if (products.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if user has already reviewed this product (optional, you can allow multiple reviews)
        const [existingReview] = await connection.execute(
            'SELECT id FROM reviews WHERE user_id = ? AND product_id = ?',
            [req.user.id, productId]
        );
        if (existingReview.length > 0) {
            return res.status(400).json({ message: 'You have already reviewed this product.' });
        }

        const [result] = await connection.execute(
            'INSERT INTO reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)',
            [req.user.id, productId, rating, comment || null] // comment can be null
        );

        res.status(201).json({
            message: 'Review submitted successfully',
            reviewId: result.insertId,
            productId,
            rating,
            comment
        });
    } catch (err) {
        console.error('Error submitting review:', err.message);
        res.status(500).send('Server Error');
    } finally {
        if (connection) connection.release();
    }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete a review (User who posted it or Admin)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();

        // Check if the review exists and belongs to the user OR if the user is an admin
        const [review] = await connection.execute('SELECT user_id FROM reviews WHERE id = ?', [req.params.id]);

        if (review.length === 0) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Ensure user is authorized (owner or admin)
        if (review[0].user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to delete this review' });
        }

        const [result] = await connection.execute('DELETE FROM reviews WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Review not found or could not be deleted' });
        }
        res.json({ message: 'Review deleted successfully' });
    } catch (err) {
        console.error('Error deleting review:', err.message);
        res.status(500).send('Server Error');
    } finally {
        if (connection) connection.release();
    }
});


module.exports = router;