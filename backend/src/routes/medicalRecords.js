import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken, verifyRole } from '../middleware/auth.js';
import db from '../config/database.js';

const router = express.Router();

// Get patient medical records
router.get('/patient/:patientId', verifyToken, async (req, res) => {
  try {
    const records = await db.any(
      'SELECT * FROM medical_records WHERE patient_id = $1 ORDER BY created_at DESC LIMIT 100',
      [req.params.patientId]
    );
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch medical records' });
  }
});

// Create medical record
router.post('/', verifyToken, verifyRole('doctor'), async (req, res) => {
  try {
    const { patientId, diagnosis, treatment, notes, attachments } = req.body;
    const recordId = uuidv4();

    // Get doctor ID
    const doctor = await db.oneOrNone('SELECT id FROM doctors WHERE user_id = $1', [req.user.id]);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    const record = await db.one(
      `INSERT INTO medical_records (id, patient_id, doctor_id, diagnosis, treatment, notes, attachments, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [recordId, patientId, doctor.id, diagnosis, treatment, notes, JSON.stringify(attachments || [])]
    );

    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create medical record' });
  }
});

// Get specific record
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const record = await db.oneOrNone(
      'SELECT * FROM medical_records WHERE id = $1',
      [req.params.id]
    );
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch medical record' });
  }
});

// Update medical record
router.put('/:id', verifyToken, verifyRole('doctor'), async (req, res) => {
  try {
    const { diagnosis, treatment, notes } = req.body;

    const record = await db.one(
      `UPDATE medical_records SET diagnosis = $1, treatment = $2, notes = $3, updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [diagnosis, treatment, notes, req.params.id]
    );

    res.json(record);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update medical record' });
  }
});

export default router;
