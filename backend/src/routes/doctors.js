import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken, verifyRole } from '../middleware/auth.js';
import db from '../config/database.js';

const router = express.Router();

// Get all doctors
router.get('/', async (req, res) => {
  try {
    const doctors = await db.any(
      `SELECT d.*, u.email, u.first_name, u.last_name, u.phone 
       FROM doctors d 
       JOIN users u ON d.user_id = u.id 
       WHERE d.is_available = true
       LIMIT 100`
    );
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

// Get doctor by ID
router.get('/:id', async (req, res) => {
  try {
    const doctor = await db.oneOrNone(
      `SELECT d.*, u.email, u.first_name, u.last_name, u.phone 
       FROM doctors d 
       JOIN users u ON d.user_id = u.id 
       WHERE d.id = $1`,
      [req.params.id]
    );
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch doctor' });
  }
});

// Create doctor profile (admin only)
router.post('/', verifyToken, verifyRole('admin'), async (req, res) => {
  try {
    const { userId, specialization, licenseNumber, yearsExperience, consultationFee, bio, isAvailable } = req.body;
    const doctorId = uuidv4();

    const doctor = await db.one(
      `INSERT INTO doctors (id, user_id, specialization, license_number, years_experience, consultation_fee, bio, is_available, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING *`,
      [doctorId, userId, specialization, licenseNumber, yearsExperience, consultationFee, bio, isAvailable ?? true]
    );

    res.status(201).json(doctor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create doctor profile' });
  }
});

// Update doctor availability
router.patch('/:id/availability', verifyToken, verifyRole('doctor', 'admin'), async (req, res) => {
  try {
    const { isAvailable } = req.body;

    const doctor = await db.one(
      'UPDATE doctors SET is_available = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [isAvailable, req.params.id]
    );

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update doctor availability' });
  }
});

// Get doctor schedule
router.get('/:id/schedule', async (req, res) => {
  try {
    const schedule = await db.any(
      'SELECT * FROM doctor_schedules WHERE doctor_id = $1 ORDER BY day_of_week, start_time',
      [req.params.id]
    );
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

export default router;
