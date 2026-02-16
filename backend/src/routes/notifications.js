import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken } from '../middleware/auth.js';
import db from '../config/database.js';

const router = express.Router();

// Get user notifications
router.get('/', verifyToken, async (req, res) => {
  try {
    const notifications = await db.any(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.patch('/:id/read', verifyToken, async (req, res) => {
  try {
    const notification = await db.one(
      'UPDATE notifications SET is_read = true, read_at = NOW() WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Mark all as read
router.patch('/mark-all/read', verifyToken, async (req, res) => {
  try {
    await db.none(
      'UPDATE notifications SET is_read = true, read_at = NOW() WHERE user_id = $1 AND is_read = false',
      [req.user.id]
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

// Delete notification
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await db.none('DELETE FROM notifications WHERE id = $1', [req.params.id]);
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

export default router;
