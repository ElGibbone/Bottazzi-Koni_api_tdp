"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const password_controller_1 = require("../controllers/password.controller");
const router = express_1.default.Router();
// Rotta per richiedere il reset della password
router.post('/request-reset', password_controller_1.requestPasswordReset);
// Rotta per verificare la validità di un token di reset
router.get('/verify-token/:token', password_controller_1.verifyResetToken);
// Rotta per reimpostare la password con un token valido
router.post('/reset/:token', password_controller_1.resetPassword);
exports.default = router;
