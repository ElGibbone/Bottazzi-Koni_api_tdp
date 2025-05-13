"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Schema per il modello utente
const userSchema = new mongoose_1.Schema({
    username: {
        type: String,
        required: [true, 'Username è obbligatorio'],
        unique: true,
        trim: true,
        minlength: [3, 'Username deve essere di almeno 3 caratteri']
    },
    password: {
        type: String,
        required: [true, 'Password è obbligatoria'],
        minlength: [6, 'Password deve essere di almeno 6 caratteri'],
        validate: {
            validator: function (value) {
                // Verifica che la password contenga almeno una lettera maiuscola, una minuscola e un numero
                const hasUpperCase = /[A-Z]/.test(value);
                const hasLowerCase = /[a-z]/.test(value);
                const hasNumber = /[0-9]/.test(value);
                return hasUpperCase && hasLowerCase && hasNumber;
            },
            message: 'La password deve contenere almeno una lettera maiuscola, una minuscola e un numero'
        }
    },
    email: {
        type: String,
        required: [true, 'Email è obbligatoria'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Formato email non valido']
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'moderator'],
        default: 'user',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: {
        type: String,
        default: null,
        index: true
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    },
    verified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String,
        default: null,
        index: true
    },
    verificationTokenExpires: {
        type: Date,
        default: null
    }
});
// Middleware pre-save per l'hashing della password
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        // Esegui l'hash della password solo se è stata modificata o è nuova
        if (!this.isModified('password'))
            return next();
        try {
            // Genera un salt e hash della password
            const salt = yield bcryptjs_1.default.genSalt(10);
            this.password = yield bcryptjs_1.default.hash(this.password, salt);
            next();
        }
        catch (error) {
            next(error);
        }
    });
});
// Metodo per confrontare le password
userSchema.methods.comparePassword = function (candidatePassword) {
    return __awaiter(this, void 0, void 0, function* () {
        // Aggiungi un controllo di sicurezza
        if (!this.password) {
            console.error('Errore: La password di questo utente è undefined');
            return false; // La password non può essere verificata, quindi fallisce
        }
        return bcryptjs_1.default.compare(candidatePassword, this.password);
    });
};
// Crea e esporta il modello utente
const User = mongoose_1.default.model('User', userSchema);
exports.default = User;
