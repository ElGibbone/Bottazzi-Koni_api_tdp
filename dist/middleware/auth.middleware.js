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
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
/**
 * Middleware per verificare l'autenticazione tramite token JWT
 */
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Ottieni il token dall'header Authorization
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Accesso non autorizzato. Token mancante' });
            return;
        }
        // Estrai il token
        const token = authHeader.split(' ')[1];
        // Verifica il token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Trova l'utente associato al token
        const user = yield user_model_1.default.findById(decoded.userId).select('-password');
        if (!user) {
            res.status(401).json({ message: 'Utente non trovato o token non valido' });
            return;
        }
        // Aggiungi l'utente alla richiesta
        req.user = user;
        next();
    }
    catch (error) {
        console.error('Errore di autenticazione:', error);
        res.status(401).json({ message: 'Token non valido o scaduto' });
    }
});
exports.authMiddleware = authMiddleware;
