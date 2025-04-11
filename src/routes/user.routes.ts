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

// Rotta per aggiornare il profilo utente
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user._id;
    
    // Verifica se l'email è in un formato valido
    if (email) {
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          message: 'Aggiornamento profilo fallito',
          error: 'invalid_email_format',
          details: 'Formato email non valido. Inserisci un indirizzo email valido.'
        });
      }
    }

    // Aggiorna il profilo utente nel database
    const updatedUser = await req.app.locals.models.User.findByIdAndUpdate(
      userId,
      { $set: { ...(name && { name }), ...(email && { email }) } },
      { new: true, runValidators: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires -verificationToken -verificationTokenExpires -__v');

    if (!updatedUser) {
      return res.status(404).json({
        message: 'Aggiornamento profilo fallito',
        error: 'user_not_found',
        details: 'Utente non trovato.'
      });
    }

    res.status(200).json({
      message: 'Profilo aggiornato con successo',
      user: updatedUser
    });
  } catch (error) {
    console.error('Errore durante l\'aggiornamento del profilo:', error);
    res.status(500).json({
      message: 'Errore del server durante l\'aggiornamento del profilo',
      error: 'server_error',
      details: 'Si è verificato un errore interno. Riprova più tardi.'
    });
  }
});

// Rotta per eliminare l'account utente
router.delete('/account', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Elimina l'account dal database
    const deletedUser = await req.app.locals.models.User.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      return res.status(404).json({
        message: 'Eliminazione account fallita',
        error: 'user_not_found',
        details: 'Utente non trovato.'
      });
    }
    
    res.status(200).json({
      message: 'Account eliminato con successo',
      success: true
    });
  } catch (error) {
    console.error('Errore durante l\'eliminazione dell\'account:', error);
    res.status(500).json({
      message: 'Errore del server durante l\'eliminazione dell\'account',
      error: 'server_error',
      details: 'Si è verificato un errore interno. Riprova più tardi.'
    });
  }
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