import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken, verifyRole } from '../middleware/auth.js';
import db from '../config/database.js';

const router = express.Router();

// Get all appointments
router.get('/', verifyToken, async (req, res) => {
  try {
    const query = 'SELECT * FROM appointments WHERE patient_id = $1 OR doctor_id IN (SELECT id FROM doctors WHERE user_id = $1) ORDER BY scheduled_at DESC LIMIT 100';
    const appointments = await db.any(query, [req.user.id]);
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Book appointment
router.post('/', verifyToken, verifyRole('patient'), async (req, res) => {
  try {
    const { doctorId, scheduledAt, reason, notes } = req.body;
    const appointmentId = uuidv4();

    // Get patient ID
    const patient = await db.oneOrNone('SELECT id FROM patients WHERE user_id = $1', [req.user.id]);
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    const appointment = await db.one(
      `INSERT INTO appointments (id, patient_id, doctor_id, scheduled_at, reason, notes, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW())
       RETURNING *`,
      [appointmentId, patient.id, doctorId, scheduledAt, reason, notes]
    );

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to book appointment' });
  }
});

// Update appointment status
router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const appointment = await db.one(
      'UPDATE appointments SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// Cancel appointment
router.patch('/:id/cancel', verifyToken, async (req, res) => {
  try {
    const appointment = await db.one(
      'UPDATE appointments SET status = $1, cancelled_at = NOW(), updated_at = NOW() WHERE id = $2 RETURNING *',
      ['cancelled', req.params.id]
    );

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

// Get available slots for doctor
router.get('/doctor/:doctorId/slots', async (req, res) => {
  try {
    const { date } = req.query;
    // This would typically query doctor schedule and existing appointments
    const slots = await db.any(
      `SELECT * FROM doctor_schedules WHERE doctor_id = $1`,
      [req.params.doctorId]
    );
    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch available slots' });
  }
});

export default router;
