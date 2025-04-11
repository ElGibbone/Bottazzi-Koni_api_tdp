import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Carica le variabili d'ambiente
dotenv.config();

/**
 * Configurazione del trasportatore di email
 * In ambiente di produzione, utilizzare un servizio SMTP reale
 * In ambiente di sviluppo, è possibile utilizzare servizi come Mailtrap o Ethereal
 */
const createTransporter = () => {
  // Verifica se sono state fornite le variabili d'ambiente necessarie
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || 
      !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Configurazione email incompleta. Verifica le variabili d\'ambiente.');
  }

  // Crea il trasportatore con le configurazioni fornite
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASS || ''
    }
  });
};

/**
 * Invia un'email di reset password
 * @param to Indirizzo email del destinatario
 * @param resetToken Token di reset password
 * @param resetUrl URL base per il reset della password
 */
export const sendPasswordResetEmail = async (
  to: string,
  resetToken: string,
  resetUrl: string
): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    
    // Costruisci l'URL completo per il reset della password
    const completeResetUrl = `${resetUrl}/${resetToken}`;
    
    // Configura il messaggio email
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'smtp.gmail.com',
      to,
      subject: 'Reset della Password',
      html: `
        <h1>Reset della Password</h1>
        <p>Hai richiesto il reset della password. Clicca sul link seguente per reimpostare la tua password:</p>
        <p><a href="${completeResetUrl}">Reset Password</a></p>
        <p>Il link scadrà tra 1 ora.</p>
        <p>Se non hai richiesto questo reset, ignora questa email e la tua password rimarrà invariata.</p>
      `
    };
    
    // Invia l'email
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Errore durante l\'invio dell\'email di reset password:', error);
    return false;
  }
};

/**
 * Invia un'email di verifica
 * @param to Indirizzo email del destinatario
 * @param verificationToken Token di verifica
 * @param verificationUrl URL base per la verifica dell'email
 */
export const sendVerificationEmail = async (
  to: string,
  verificationToken: string,
  verificationUrl: string
): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    
    // Costruisci l'URL completo per la verifica dell'email
    const completeVerificationUrl = `${verificationUrl}/confirm/${verificationToken}`;
    
    // Configura il messaggio email
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'smtp.gmail.com',
      to,
      subject: 'Verifica il tuo indirizzo email',
      html: `
        <h1>Verifica il tuo indirizzo email</h1>
        <p>Grazie per esserti registrato! Clicca sul link seguente per verificare il tuo indirizzo email:</p>
        <p><a href="${completeVerificationUrl}">Verifica Email</a></p>
        <p>Il link scadrà tra 24 ore.</p>
        <p>Se non hai creato un account, ignora questa email.</p>
      `
    };
    
    // Invia l'email
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Errore durante l\'invio dell\'email di verifica:', error);
    return false;
  }
};