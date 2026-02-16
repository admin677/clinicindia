import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken, verifyRole } from '../middleware/auth.js';
import db from '../config/database.js';

const router = express.Router();

// Get prescriptions
router.get('/', verifyToken, async (req, res) => {
  try {
    const prescriptions = await db.any(
      `SELECT p.* FROM prescriptions p
       WHERE p.patient_id IN (SELECT id FROM patients WHERE user_id = $1)
       OR p.doctor_id IN (SELECT id FROM doctors WHERE user_id = $1)
       ORDER BY p.created_at DESC LIMIT 100`,
      [req.user.id]
    );
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
});

// Create prescription
router.post('/', verifyToken, verifyRole('doctor'), async (req, res) => {
  try {
    const { patientId, medications, instructions, validUntil } = req.body;
    const prescriptionId = uuidv4();

    // Get doctor ID
    const doctor = await db.oneOrNone('SELECT id FROM doctors WHERE user_id = $1', [req.user.id]);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    const prescription = await db.one(
      `INSERT INTO prescriptions (id, patient_id, doctor_id, medications, instructions, valid_until, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [prescriptionId, patientId, doctor.id, JSON.stringify(medications), instructions, validUntil]
    );

    res.status(201).json(prescription);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create prescription' });
  }
});

// Get prescription details
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const prescription = await db.oneOrNone(
      'SELECT * FROM prescriptions WHERE id = $1',
      [req.params.id]
    );
    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }
    res.json(prescription);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prescription' });
  }
});

export default router;
