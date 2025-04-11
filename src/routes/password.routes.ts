import express from 'express';
import { requestPasswordReset, verifyResetToken, resetPassword } from '../controllers/password.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// Rotta per richiedere il reset della password
router.post('/request-reset', requestPasswordReset);

// Rotta per verificare la validità di un token di reset
router.get('/verify-token/:token', verifyResetToken);

// Rotta per reimpostare la password con un token valido
router.post('/reset/:token', resetPassword);

// Rotta per cambiare la password (richiede autenticazione)
router.post('/change', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user._id;

    // Verifica se tutti i campi necessari sono stati forniti
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: 'Cambio password fallito',
        error: 'missing_fields',
        details: 'Password attuale, nuova password e conferma password sono tutti campi obbligatori.'
      });
    }

    // Verifica che le password coincidano
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: 'Cambio password fallito',
        error: 'passwords_do_not_match',
        details: 'La nuova password e la password di conferma non corrispondono.'
      });
    }

    // Trova l'utente nel database
    const user = await req.app.locals.models.User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: 'Cambio password fallito',
        error: 'user_not_found',
        details: 'Utente non trovato.'
      });
    }

    // Verifica che la password attuale sia corretta
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Cambio password fallito',
        error: 'invalid_current_password',
        details: 'La password attuale non è corretta.'
      });
    }

    // Aggiorna la password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      message: 'Password cambiata con successo.',
      success: true
    });
  } catch (error) {
    console.error('Errore durante il cambio password:', error);
    res.status(500).json({
      message: 'Errore del server durante il cambio password',
      error: 'server_error',
      details: 'Si è verificato un errore interno. Riprova più tardi.'
    });
  }
});

export default router;