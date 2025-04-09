"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = express_1.default.Router();
// Rotta protetta che richiede solo autenticazione (accessibile a tutti gli utenti autenticati)
router.get('/profile', auth_middleware_1.authMiddleware, (req, res) => {
    // L'utente è già disponibile nella richiesta grazie al middleware
    res.status(200).json({
        message: 'Profilo utente recuperato con successo',
        user: req.user
    });
});
// Esempio di rotta protetta che richiede ruolo moderator o admin
router.get('/moderator-dashboard', auth_middleware_1.authMiddleware, (0, role_middleware_1.roleMiddleware)(['moderator', 'admin']), (req, res) => {
    res.status(200).json({
        message: 'Dashboard moderatore accessibile',
        user: req.user
    });
});
// Esempio di rotta protetta che richiede solo ruolo admin
router.get('/admin-dashboard', auth_middleware_1.authMiddleware, (0, role_middleware_1.roleMiddleware)(['admin']), (req, res) => {
    res.status(200).json({
        message: 'Dashboard admin accessibile',
        user: req.user
    });
});
exports.default = router;
