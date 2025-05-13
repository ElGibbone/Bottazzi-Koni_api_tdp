"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = express_1.default.Router();
// Rotte pubbliche
router.post('/register', auth_controller_1.register);
router.post('/login', auth_controller_1.login);
// Rotte protette (solo per admin)
router.put('/users/role', auth_middleware_1.authMiddleware, (0, role_middleware_1.roleMiddleware)(['admin']), auth_controller_1.updateUserRole);
router.get('/users', auth_middleware_1.authMiddleware, (0, role_middleware_1.roleMiddleware)(['admin']), auth_controller_1.getAllUsers);
exports.default = router;
