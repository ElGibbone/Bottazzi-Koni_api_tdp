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
const express_1 = __importDefault(require("express"));
const password_controller_1 = require("../controllers/password.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Rotta per richiedere il reset della password
router.post('/request-reset', password_controller_1.requestPasswordReset);
// Rotta per verificare la validità di un token di reset
router.get('/verify-token/:token', password_controller_1.verifyResetToken);
// Rotta per reimpostare la password con un token valido
router.post('/reset/:token', password_controller_1.resetPassword);
// Rotta per cambiare la password (richiede autenticazione)
router.post('/change', auth_middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const user = yield req.app.locals.models.User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: 'Cambio password fallito',
                error: 'user_not_found',
                details: 'Utente non trovato.'
            });
        }
        // Verifica che la password attuale sia corretta
        const isMatch = yield user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                message: 'Cambio password fallito',
                error: 'invalid_current_password',
                details: 'La password attuale non è corretta.'
            });
        }
        // Aggiorna la password
        user.password = newPassword;
        yield user.save();
        res.status(200).json({
            message: 'Password cambiata con successo.',
            success: true
        });
    }
    catch (error) {
        console.error('Errore durante il cambio password:', error);
        res.status(500).json({
            message: 'Errore del server durante il cambio password',
            error: 'server_error',
            details: 'Si è verificato un errore interno. Riprova più tardi.'
        });
    }
}));
exports.default = router;
