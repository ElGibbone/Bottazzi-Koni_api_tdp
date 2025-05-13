import express from 'express';
import { sendVerificationEmailController, verifyEmail, resendVerificationEmail } from '../controllers/email.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// Rotta per verificare l'email tramite token (POST)
router.post('/verify', verifyEmail);

// Rotta per confermare l'email tramite token (GET)
router.get('/confirm/:token', verifyEmail);

// Aggiunta rotta per gestire il caso di doppio "confirm" per i link già inviati
router.get('/confirm/confirm/:token', verifyEmail);

// Rotta per richiedere un nuovo invio dell'email di verifica
router.post('/resend-verification', resendVerificationEmail);

// Rotta protetta per inviare manualmente un'email di verifica (solo per debug/admin)
router.post('/send-verification', authMiddleware, sendVerificationEmailController);

export default router;