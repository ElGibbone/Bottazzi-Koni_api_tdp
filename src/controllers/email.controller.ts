import { Request, Response } from 'express';
import crypto from 'crypto';
import User from '../models/user.model';
import { sendVerificationEmail } from '../utils/email.utils';

/**
 * Invia un'email di verifica all'utente appena registrato
 */
export const sendVerificationEmailController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    // Trova l'utente tramite email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ 
        message: 'Invio email fallito', 
        error: 'user_not_found',
        details: 'Utente non trovato.'
      });
      return;
    }

    // Se l'utente è già verificato
    if (user.verified) {
      res.status(400).json({ 
        message: 'Invio email fallito', 
        error: 'already_verified',
        details: 'L\'account è già verificato.'
      });
      return;
    }

    // Genera un token di verifica
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Imposta la scadenza del token (24 ore)
    const verificationTokenExpires = new Date();
    verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24);

    // Aggiorna l'utente con il token di verifica
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;
    await user.save();

    // Costruisci l'URL di verifica
    const verificationUrl = process.env.VERIFY_EMAIL_URL || 'http://localhost:3000/verify-email';

    // Invia l'email di verifica
    const emailSent = await sendVerificationEmail(user.email, verificationToken, verificationUrl);

    if (emailSent) {
      res.status(200).json({ 
        message: 'Email di verifica inviata con successo',
        email: user.email
      });
    } else {
      res.status(500).json({ 
        message: 'Invio email fallito', 
        error: 'email_sending_failed',
        details: 'Impossibile inviare l\'email di verifica. Riprova più tardi.'
      });
    }
  } catch (error) {
    console.error('Errore durante l\'invio dell\'email di verifica:', error);
    res.status(500).json({ 
      message: 'Invio email fallito', 
      error: 'server_error',
      details: 'Si è verificato un errore durante l\'invio dell\'email di verifica.'
    });
  }
};

/**
 * Verifica l'email dell'utente tramite il token di verifica
 */
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    // Ottieni il token dai parametri dell'URL (GET) o dal corpo della richiesta (POST) o dalla query string
    const token = req.params.token || req.body.token || req.query.token;

    if (!token) {
      res.status(400).json({ 
        message: 'Verifica fallita', 
        error: 'missing_token',
        details: 'Token di verifica mancante.'
      });
      return;
    }

    // Trova l'utente con il token di verifica
    const user = await User.findOne({ 
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() } // Verifica che il token non sia scaduto
    });

    if (!user) {
      res.status(400).json({ 
        message: 'Verifica fallita', 
        error: 'invalid_or_expired_token',
        details: 'Token di verifica non valido o scaduto.'
      });
      return;
    }

    // Aggiorna lo stato di verifica dell'utente
    user.verified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.status(200).json({ 
      message: 'Email verificata con successo',
      verified: true
    });
  } catch (error) {
    console.error('Errore durante la verifica dell\'email:', error);
    res.status(500).json({ 
      message: 'Verifica fallita', 
      error: 'server_error',
      details: 'Si è verificato un errore durante la verifica dell\'email.'
    });
  }
};

/**
 * Richiede un nuovo invio dell'email di verifica
 */
export const resendVerificationEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    // Trova l'utente tramite email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ 
        message: 'Invio email fallito', 
        error: 'user_not_found',
        details: 'Utente non trovato.'
      });
      return;
    }

    // Se l'utente è già verificato
    if (user.verified) {
      res.status(400).json({ 
        message: 'Invio email fallito', 
        error: 'already_verified',
        details: 'L\'account è già verificato.'
      });
      return;
    }

    // Genera un nuovo token di verifica
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Imposta la scadenza del token (24 ore)
    const verificationTokenExpires = new Date();
    verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24);

    // Aggiorna l'utente con il nuovo token di verifica
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;
    await user.save();

    // Costruisci l'URL di verifica
    const verificationUrl = process.env.VERIFY_EMAIL_URL || 'http://localhost:3000/verify-email';

    // Invia l'email di verifica
    const emailSent = await sendVerificationEmail(user.email, verificationToken, verificationUrl);

    if (emailSent) {
      res.status(200).json({ 
        message: 'Email di verifica inviata con successo',
        email: user.email
      });
    } else {
      res.status(500).json({ 
        message: 'Invio email fallito', 
        error: 'email_sending_failed',
        details: 'Impossibile inviare l\'email di verifica. Riprova più tardi.'
      });
    }
  } catch (error) {
    console.error('Errore durante l\'invio dell\'email di verifica:', error);
    res.status(500).json({ 
      message: 'Invio email fallito', 
      error: 'server_error',
      details: 'Si è verificato un errore durante l\'invio dell\'email di verifica.'
    });
  }
};