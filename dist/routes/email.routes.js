"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const email_controller_1 = require("../controllers/email.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Rotta per verificare l'email tramite token (POST)
router.post('/verify', email_controller_1.verifyEmail);
// Rotta per confermare l'email tramite token (GET)
router.get('/confirm/:token', email_controller_1.verifyEmail);
// Rotta per richiedere un nuovo invio dell'email di verifica
router.post('/resend-verification', email_controller_1.resendVerificationEmail);
// Rotta protetta per inviare manualmente un'email di verifica (solo per debug/admin)
router.post('/send-verification', auth_middleware_1.authMiddleware, email_controller_1.sendVerificationEmailController);
exports.default = router;
