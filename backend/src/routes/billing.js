import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken, verifyRole } from '../middleware/auth.js';
import db from '../config/database.js';

const router = express.Router();

// Get invoices
router.get('/', verifyToken, async (req, res) => {
  try {
    const invoices = await db.any(
      'SELECT * FROM invoices WHERE patient_id IN (SELECT id FROM patients WHERE user_id = $1) ORDER BY created_at DESC LIMIT 100',
      [req.user.id]
    );
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Create invoice
router.post('/', verifyToken, verifyRole('admin', 'doctor'), async (req, res) => {
  try {
    const { patientId, amount, description, items } = req.body;
    const invoiceId = uuidv4();

    const invoice = await db.one(
      `INSERT INTO invoices (id, patient_id, amount, description, items, status, created_at)
       VALUES ($1, $2, $3, $4, $5, 'pending', NOW())
       RETURNING *`,
      [invoiceId, patientId, amount, description, JSON.stringify(items)]
    );

    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// Process payment
router.post('/:invoiceId/payment', verifyToken, async (req, res) => {
  try {
    const { paymentMethod, transactionId } = req.body;

    const payment = await db.one(
      `INSERT INTO payments (id, invoice_id, amount, payment_method, transaction_id, status, created_at)
       SELECT $2, $1, amount, $3, $4, 'completed', NOW() FROM invoices WHERE id = $1
       RETURNING *`,
      [req.params.invoiceId, uuidv4(), paymentMethod, transactionId]
    );

    // Update invoice status
    await db.none('UPDATE invoices SET status = $1, paid_at = NOW() WHERE id = $2', ['paid', req.params.invoiceId]);

    res.json({ message: 'Payment successful', payment });
  } catch (error) {
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

// Get invoice
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const invoice = await db.oneOrNone(
      'SELECT * FROM invoices WHERE id = $1',
      [req.params.id]
    );
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

export default router;
