import express from 'express';
import { register, login, updateUserRole, getAllUsers } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';

const router = express.Router();

// Rotte pubbliche
router.post('/register', register);
router.post('/login', login);

// Rotte protette (solo per admin)
router.put('/users/role', authMiddleware, roleMiddleware(['admin']), updateUserRole);
router.get('/users', authMiddleware, roleMiddleware(['admin']), getAllUsers);

export default router;