import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';

const router = express.Router();

// Rotta protetta che richiede solo autenticazione (accessibile a tutti gli utenti autenticati)
router.get('/profile', authMiddleware, (req, res) => {
  // L'utente è già disponibile nella richiesta grazie al middleware
  res.status(200).json({
    message: 'Profilo utente recuperato con successo',
    user: req.user
  });
});

// Esempio di rotta protetta che richiede ruolo moderator o admin
router.get('/moderator-dashboard', 
  authMiddleware, 
  roleMiddleware(['moderator', 'admin']), 
  (req, res) => {
    res.status(200).json({
      message: 'Dashboard moderatore accessibile',
      user: req.user
    });
  }
);

// Esempio di rotta protetta che richiede solo ruolo admin
router.get('/admin-dashboard', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  (req, res) => {
    res.status(200).json({
      message: 'Dashboard admin accessibile',
      user: req.user
    });
  }
);

export default router;