import express from 'express';
import { requestPasswordReset, verifyResetToken, resetPassword } from '../controllers/password.controller';

const router = express.Router();

// Rotta per richiedere il reset della password
router.post('/request-reset', requestPasswordReset);

// Rotta per verificare la validità di un token di reset
router.get('/verify-token/:token', verifyResetToken);

// Rotta per reimpostare la password con un token valido
router.post('/reset/:token', resetPassword);

export default router;