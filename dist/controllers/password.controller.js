"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.verifyResetToken = exports.requestPasswordReset = void 0;
const crypto_1 = __importDefault(require("crypto"));
const user_model_1 = __importDefault(require("../models/user.model"));
const email_utils_1 = require("../utils/email.utils");
/**
 * Controller per richiedere il reset della password
 * Genera un token univoco, lo salva nel database e invia un'email con il link di reset
 */
const requestPasswordReset = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        // Verifica se l'email è stata fornita
        if (!email) {
            res.status(400).json({
                message: 'Richiesta reset password fallita',
                error: 'missing_email',
                details: 'L\'indirizzo email è obbligatorio.'
            });
            return;
        }
        // Verifica se l'email è in un formato valido
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({
                message: 'Richiesta reset password fallita',
                error: 'invalid_email_format',
                details: 'Formato email non valido. Inserisci un indirizzo email valido.'
            });
            return;
        }
        // Trova l'utente con l'email fornita
        const user = yield user_model_1.default.findOne({ email });
        if (!user) {
            // Per motivi di sicurezza, non rivelare che l'email non esiste nel database
            // Restituisci comunque una risposta positiva
            res.status(200).json({
                message: 'Se l\'indirizzo email è registrato, riceverai un\'email con le istruzioni per reimpostare la password.'
            });
            return;
        }
        // Genera un token casuale
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        // Salva il token e la data di scadenza nel database
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // Scade dopo 1 ora
        yield user.save();
        // Ottieni l'URL base per il reset della password dalle variabili d'ambiente
        const resetUrl = process.env.RESET_PASSWORD_URL || 'http://localhost:3000/reset-password';
        // Invia l'email di reset
        const emailSent = yield (0, email_utils_1.sendPasswordResetEmail)(user.email, resetToken, resetUrl);
        if (emailSent) {
            res.status(200).json({
                message: 'Email di reset password inviata con successo. Controlla la tua casella di posta.'
            });
        }
        else {
            // Se l'invio dell'email fallisce, rimuovi il token dal database
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            yield user.save();
            res.status(500).json({
                message: 'Invio email fallito',
                error: 'email_sending_failed',
                details: 'Non è stato possibile inviare l\'email di reset. Riprova più tardi.'
            });
        }
    }
    catch (error) {
        console.error('Errore durante la richiesta di reset password:', error);
        res.status(500).json({
            message: 'Errore del server durante la richiesta di reset password',
            error: 'server_error',
            details: 'Si è verificato un errore interno. Riprova più tardi.'
        });
    }
});
exports.requestPasswordReset = requestPasswordReset;
/**
 * Controller per verificare la validità di un token di reset password
 */
const verifyResetToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        // Verifica se il token è stato fornito
        if (!token) {
            res.status(400).json({
                message: 'Verifica token fallita',
                error: 'missing_token',
                details: 'Token di reset non fornito.'
            });
            return;
        }
        // Trova l'utente con il token fornito e verifica che non sia scaduto
        const user = yield user_model_1.default.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() }
        });
        if (!user) {
            res.status(400).json({
                message: 'Verifica token fallita',
                error: 'invalid_or_expired_token',
                details: 'Il token di reset non è valido o è scaduto.'
            });
            return;
        }
        // Il token è valido
        res.status(200).json({
            message: 'Token di reset valido',
            valid: true
        });
    }
    catch (error) {
        console.error('Errore durante la verifica del token di reset:', error);
        res.status(500).json({
            message: 'Errore del server durante la verifica del token',
            error: 'server_error',
            details: 'Si è verificato un errore interno. Riprova più tardi.'
        });
    }
});
exports.verifyResetToken = verifyResetToken;
/**
 * Controller per reimpostare la password utilizzando un token valido
 */
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;
        console.log('Reset password richiesto con token:', token);
        console.log('Payload ricevuto:', { password: '***', confirmPassword: '***' });
        // Verifica se tutti i campi necessari sono stati forniti
        if (!token || !password || !confirmPassword) {
            console.log('Campi mancanti:', {
                hasToken: !!token,
                hasPassword: !!password,
                hasConfirmPassword: !!confirmPassword
            });
            res.status(400).json({
                message: 'Reset password fallito',
                error: 'missing_fields',
                details: 'Token, password e conferma password sono obbligatori.'
            });
            return;
        }
        // Verifica che le password corrispondano
        if (password !== confirmPassword) {
            console.log('Le password non corrispondono');
            res.status(400).json({
                message: 'Reset password fallito',
                error: 'passwords_do_not_match',
                details: 'La password e la conferma password non corrispondono.'
            });
            return;
        }
        // Validazione password
        if (password.length < 6) {
            console.log('Password troppo corta:', password.length);
            res.status(400).json({
                message: 'Reset password fallito',
                error: 'password_too_short',
                details: 'La password deve essere di almeno 6 caratteri.'
            });
            return;
        }
        // Validazione complessità password
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        if (!(hasUpperCase && hasLowerCase && hasNumber)) {
            console.log('Complessità password non sufficiente:', { hasUpperCase, hasLowerCase, hasNumber });
            res.status(400).json({
                message: 'Reset password fallito',
                error: 'password_complexity',
                details: 'La password deve contenere almeno una lettera maiuscola, una minuscola e un numero.'
            });
            return;
        }
        // Trova l'utente con il token fornito e verifica che non sia scaduto
        console.log('Ricerca utente con token:', token);
        const user = yield user_model_1.default.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() }
        });
        if (!user) {
            console.log('Nessun utente trovato con il token o token scaduto');
            res.status(400).json({
                message: 'Reset password fallito',
                error: 'invalid_or_expired_token',
                details: 'Il token di reset non è valido o è scaduto.'
            });
            return;
        }
        console.log('Utente trovato, aggiornamento password per:', user.email);
        // Aggiorna la password e rimuovi il token di reset
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        yield user.save();
        res.status(200).json({
            message: 'Password reimpostata con successo. Ora puoi accedere con la tua nuova password.'
        });
    }
    catch (error) {
        console.error('Errore durante il reset della password:', error);
        res.status(500).json({
            message: 'Errore del server durante il reset della password',
            error: 'server_error',
            details: 'Si è verificato un errore interno. Riprova più tardi.'
        });
    }
});
exports.resetPassword = resetPassword;
