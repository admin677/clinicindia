import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken, verifyRole } from '../middleware/auth.js';
import db from '../config/database.js';

const router = express.Router();

// Get all patients (admin/doctor only)
router.get('/', verifyToken, verifyRole('admin', 'doctor'), async (req, res) => {
  try {
    const patients = await db.any('SELECT id, user_id, blood_type, allergies, medical_history, emergency_contact, insurance_provider FROM patients LIMIT 100');
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// Get patient profile
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const patient = await db.oneOrNone(
      'SELECT p.*, u.email, u.first_name, u.last_name, u.phone FROM patients p JOIN users u ON p.user_id = u.id WHERE p.id = $1',
      [req.params.id]
    );
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
});

// Create/Update patient profile
router.post('/', verifyToken, verifyRole('patient'), async (req, res) => {
  try {
    const { bloodType, allergies, medicalHistory, emergencyContact, insuranceProvider } = req.body;
    const patientId = uuidv4();

    const patient = await db.one(
      `INSERT INTO patients (id, user_id, blood_type, allergies, medical_history, emergency_contact, insurance_provider, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [patientId, req.user.id, bloodType, allergies, medicalHistory, emergencyContact, insuranceProvider]
    );

    res.status(201).json(patient);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create patient profile' });
  }
});

// Update patient profile
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { bloodType, allergies, medicalHistory, emergencyContact, insuranceProvider } = req.body;

    const patient = await db.one(
      `UPDATE patients SET blood_type = $1, allergies = $2, medical_history = $3, emergency_contact = $4, insurance_provider = $5, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [req.params.id, bloodType, allergies, medicalHistory, emergencyContact, insuranceProvider]
    );

    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update patient profile' });
  }
});

export default router;
