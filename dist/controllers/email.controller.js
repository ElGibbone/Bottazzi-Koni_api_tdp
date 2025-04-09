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
exports.resendVerificationEmail = exports.verifyEmail = exports.sendVerificationEmailController = void 0;
const crypto_1 = __importDefault(require("crypto"));
const user_model_1 = __importDefault(require("../models/user.model"));
const email_utils_1 = require("../utils/email.utils");
/**
 * Invia un'email di verifica all'utente appena registrato
 */
const sendVerificationEmailController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        // Trova l'utente tramite email
        const user = yield user_model_1.default.findOne({ email });
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
        const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
        // Imposta la scadenza del token (24 ore)
        const verificationTokenExpires = new Date();
        verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24);
        // Aggiorna l'utente con il token di verifica
        user.verificationToken = verificationToken;
        user.verificationTokenExpires = verificationTokenExpires;
        yield user.save();
        // Costruisci l'URL di verifica
        const verificationUrl = process.env.VERIFY_EMAIL_URL || 'http://localhost:3000/verify-email';
        // Invia l'email di verifica
        const emailSent = yield (0, email_utils_1.sendVerificationEmail)(user.email, verificationToken, verificationUrl);
        if (emailSent) {
            res.status(200).json({
                message: 'Email di verifica inviata con successo',
                email: user.email
            });
        }
        else {
            res.status(500).json({
                message: 'Invio email fallito',
                error: 'email_sending_failed',
                details: 'Impossibile inviare l\'email di verifica. Riprova più tardi.'
            });
        }
    }
    catch (error) {
        console.error('Errore durante l\'invio dell\'email di verifica:', error);
        res.status(500).json({
            message: 'Invio email fallito',
            error: 'server_error',
            details: 'Si è verificato un errore durante l\'invio dell\'email di verifica.'
        });
    }
});
exports.sendVerificationEmailController = sendVerificationEmailController;
/**
 * Verifica l'email dell'utente tramite il token di verifica
 */
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const user = yield user_model_1.default.findOne({
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
        yield user.save();
        res.status(200).json({
            message: 'Email verificata con successo',
            verified: true
        });
    }
    catch (error) {
        console.error('Errore durante la verifica dell\'email:', error);
        res.status(500).json({
            message: 'Verifica fallita',
            error: 'server_error',
            details: 'Si è verificato un errore durante la verifica dell\'email.'
        });
    }
});
exports.verifyEmail = verifyEmail;
/**
 * Richiede un nuovo invio dell'email di verifica
 */
const resendVerificationEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        // Trova l'utente tramite email
        const user = yield user_model_1.default.findOne({ email });
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
        const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
        // Imposta la scadenza del token (24 ore)
        const verificationTokenExpires = new Date();
        verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24);
        // Aggiorna l'utente con il nuovo token di verifica
        user.verificationToken = verificationToken;
        user.verificationTokenExpires = verificationTokenExpires;
        yield user.save();
        // Costruisci l'URL di verifica
        const verificationUrl = process.env.VERIFY_EMAIL_URL || 'http://localhost:3000/verify-email';
        // Invia l'email di verifica
        const emailSent = yield (0, email_utils_1.sendVerificationEmail)(user.email, verificationToken, verificationUrl);
        if (emailSent) {
            res.status(200).json({
                message: 'Email di verifica inviata con successo',
                email: user.email
            });
        }
        else {
            res.status(500).json({
                message: 'Invio email fallito',
                error: 'email_sending_failed',
                details: 'Impossibile inviare l\'email di verifica. Riprova più tardi.'
            });
        }
    }
    catch (error) {
        console.error('Errore durante l\'invio dell\'email di verifica:', error);
        res.status(500).json({
            message: 'Invio email fallito',
            error: 'server_error',
            details: 'Si è verificato un errore durante l\'invio dell\'email di verifica.'
        });
    }
});
exports.resendVerificationEmail = resendVerificationEmail;
