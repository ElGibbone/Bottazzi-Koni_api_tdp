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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.getAllUsers = exports.updateUserRole = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const user_model_1 = __importDefault(require("../models/user.model"));
const email_utils_1 = require("../utils/email.utils");
/**
 * Controller per la registrazione di un nuovo utente
 */
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Verifica che i dati necessari siano presenti nella richiesta
        if (!req.body) {
            res.status(400).json({
                message: 'Registrazione fallita',
                error: 'missing_data',
                details: 'I dati di registrazione sono obbligatori'
            });
            return;
        }
        const { username, email, password } = req.body;
        // Verifica che tutti i campi obbligatori siano presenti
        if (!username || !email || !password) {
            res.status(400).json({
                message: 'Registrazione fallita',
                error: 'missing_fields',
                details: 'Username, email e password sono campi obbligatori'
            });
            return;
        }
        // Verifica se l'username è già in uso
        const existingUsername = yield user_model_1.default.findOne({ username });
        if (existingUsername) {
            res.status(400).json({
                message: 'Registrazione fallita',
                error: 'username_already_exists',
                details: 'Username già in uso. Scegli un altro username.'
            });
            return;
        }
        // Verifica se l'email è già in uso
        const existingEmail = yield user_model_1.default.findOne({ email });
        if (existingEmail) {
            res.status(400).json({
                message: 'Registrazione fallita',
                error: 'email_already_exists',
                details: 'Email già in uso. Utilizza un altro indirizzo email.'
            });
            return;
        }
        // Validazione email
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({
                message: 'Registrazione fallita',
                error: 'invalid_email_format',
                details: 'Formato email non valido. L\'indirizzo email deve contenere il simbolo @ e un dominio valido (esempio: user@domain.com).'
            });
            return;
        }
        // Validazione password - controlla esplicitamente che sia una stringa
        if (typeof password !== 'string') {
            res.status(400).json({
                message: 'Registrazione fallita',
                error: 'invalid_password',
                details: 'La password deve essere una stringa di testo valida.'
            });
            return;
        }
        // Validazione lunghezza password
        if (password.length < 6) {
            res.status(400).json({
                message: 'Registrazione fallita',
                error: 'password_too_short',
                details: 'La password è troppo corta. Deve contenere almeno 6 caratteri. Hai inserito solo ' + password.length + ' caratteri.'
            });
            return;
        }
        // Validazione complessità password
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const missingRequirements = [];
        if (!hasUpperCase)
            missingRequirements.push('una lettera maiuscola');
        if (!hasLowerCase)
            missingRequirements.push('una lettera minuscola');
        if (!hasNumber)
            missingRequirements.push('un numero');
        if (missingRequirements.length > 0) {
            res.status(400).json({
                message: 'Registrazione fallita',
                error: 'password_complexity',
                details: `La password non soddisfa i requisiti di sicurezza. Manca: ${missingRequirements.join(', ')}.`
            });
            return;
        }
        // Validazione username
        if (username.length < 3) {
            res.status(400).json({
                message: 'Registrazione fallita',
                error: 'username_too_short',
                details: `Username troppo corto. Deve contenere almeno 3 caratteri. Hai inserito solo ${username.length} caratteri.`
            });
            return;
        }
        // Genera un token di verifica per l'email
        const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
        // Imposta la scadenza del token (24 ore)
        const verificationTokenExpires = new Date();
        verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24);
        // Crea un nuovo utente
        const newUser = new user_model_1.default({
            username,
            email,
            password, // La password verrà hashata automaticamente dal middleware pre-save
            role: req.body.role || 'user', // Assegna il ruolo specificato o 'user' come default
            verified: false,
            verificationToken,
            verificationTokenExpires
        });
        // Salva l'utente nel database
        yield newUser.save();
        // Controlla che le variabili d'ambiente necessarie siano definite
        if (!process.env.VERIFY_EMAIL_URL) {
            console.warn('VERIFY_EMAIL_URL non definito. Usando URL di default.');
        }
        // Costruisci l'URL di verifica
        const verificationUrl = process.env.VERIFY_EMAIL_URL || 'http://localhost:8080/verify-email';
        // Invia l'email di verifica
        try {
            yield (0, email_utils_1.sendVerificationEmail)(newUser.email, verificationToken, verificationUrl);
        }
        catch (emailError) {
            console.error('Errore durante l\'invio dell\'email di verifica:', emailError);
            // Continuiamo il processo di registrazione anche se l'invio dell'email fallisce
            // ma logghiamo l'errore per scopi di debug
        }
        // Genera il token JWT
        if (typeof process.env.JWT_SECRET !== 'string') {
            console.warn('JWT_SECRET non definito correttamente. Usando un valore predefinito.');
            process.env.JWT_SECRET = 'default_jwt_secret_key';
        }
        // Opzioni JWT
        const jwtOptions = {
            expiresIn: (process.env.JWT_EXPIRES_IN || '1d')
        };
        // Firma il token
        const token = jsonwebtoken_1.default.sign({ userId: newUser._id }, process.env.JWT_SECRET, jwtOptions);
        // Crea un oggetto utente specifico per la risposta
        const userResponse = {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
            verified: newUser.verified
        };
        // Risposta con successo
        res.status(201).json(Object.assign({
            message: 'Utente registrato con successo. Controlla la tua email per verificare il tuo account.',
            token,
            user: userResponse // Usa l'oggetto utente creato appositamente
        }, (process.env.NODE_ENV !== 'production' && {
            verificationInfo: {
                token: verificationToken,
                verificationUrl: `${verificationUrl}?token=${verificationToken}`
            }
        })));
    }
    catch (error) {
        console.error('Errore durante la registrazione:', error);
        // Gestione degli errori di validazione di Mongoose
        if (error.name === 'ValidationError') {
            const validationErrors = {};
            // Estrai i messaggi di errore per ogni campo
            if (error.errors) {
                Object.keys(error.errors).forEach(key => {
                    validationErrors[key] = error.errors[key].message;
                });
            }
            res.status(400).json({
                message: 'Registrazione fallita',
                error: 'validation_error',
                details: validationErrors
            });
            return;
        }
        // Gestione degli errori di duplicazione (codice 11000 in MongoDB)
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0] || 'campo';
            const errorMessage = field === 'username'
                ? 'Username già in uso. Scegli un altro username.'
                : 'Email già in uso. Utilizza un altro indirizzo email.';
            res.status(400).json({
                message: 'Registrazione fallita',
                error: `${field}_already_exists`,
                details: errorMessage
            });
            return;
        }
        // Altri errori del server
        res.status(500).json({
            message: 'Errore del server durante la registrazione',
            error: 'server_error',
            details: error.message || 'Si è verificato un errore interno. Riprova più tardi.'
        });
    }
});
exports.register = register;
/**
 * Controller per il login di un utente
 */
/**
 * Aggiorna il ruolo di un utente (solo per admin)
 */
const updateUserRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, role } = req.body;
        // Verifica che il ruolo sia valido
        const validRoles = ['user', 'admin', 'moderator'];
        if (!validRoles.includes(role)) {
            res.status(400).json({
                message: 'Aggiornamento ruolo fallito',
                error: 'invalid_role',
                details: 'Il ruolo specificato non è valido. Ruoli validi: user, admin, moderator'
            });
            return;
        }
        // Trova e aggiorna l'utente in un'unica operazione, selezionando i campi per la risposta
        const updatedUser = yield user_model_1.default.findByIdAndUpdate(userId, { role }, { new: true, runValidators: true } // new: restituisce il doc aggiornato, runValidators: esegue validatori schema
        ).select('_id username email role'); // Seleziona solo i campi desiderati
        if (!updatedUser) {
            res.status(404).json({
                message: 'Aggiornamento ruolo fallito',
                error: 'user_not_found',
                details: 'Utente non trovato'
            });
            return;
        }
        res.status(200).json({
            message: 'Ruolo utente aggiornato con successo',
            user: updatedUser // updatedUser contiene già solo i campi selezionati
        });
    }
    catch (error) {
        console.error('Errore durante l\'aggiornamento del ruolo:', error);
        res.status(500).json({
            message: 'Errore del server durante l\'aggiornamento del ruolo',
            error: 'server_error',
            details: 'Si è verificato un errore interno. Riprova più tardi.'
        });
    }
});
exports.updateUserRole = updateUserRole;
/**
 * Ottiene la lista di tutti gli utenti con i loro ruoli (solo per admin)
 */
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Trova tutti gli utenti, escludendo i campi sensibili e non necessari per la lista
        const users = yield user_model_1.default.find().select('-password -verificationToken -verificationTokenExpires -resetPasswordToken -resetPasswordExpires -__v');
        res.status(200).json({
            message: 'Lista utenti recuperata con successo',
            users: users // Gli utenti contengono già solo i campi selezionati
            // Non è più necessario mappare se .select() ha già escluso i campi
            // users: users.map(user => ({
            //   id: user._id,
            //   username: user.username,
            //   email: user.email,
            //   role: user.role,
            //   createdAt: user.createdAt
            // }))
        });
    }
    catch (error) {
        console.error('Errore durante il recupero degli utenti:', error);
        res.status(500).json({
            message: 'Errore del server durante il recupero degli utenti',
            error: 'server_error',
            details: 'Si è verificato un errore interno. Riprova più tardi.'
        });
    }
});
exports.getAllUsers = getAllUsers;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Verifica che i dati necessari siano presenti nella richiesta
        if (!req.body) {
            res.status(400).json({
                message: 'Login fallito',
                error: 'missing_data',
                details: 'I dati di login sono mancanti. Assicurati di inviare un corpo della richiesta valido.'
            });
            return;
        }
        const { username, password } = req.body;
        // Verifica se i campi sono stati forniti
        if (!username && !password) {
            res.status(400).json({
                message: 'Login fallito',
                error: 'missing_credentials',
                details: 'Username e password sono entrambi mancanti. Entrambi i campi sono obbligatori per il login.'
            });
            return;
        }
        if (!username) {
            res.status(400).json({
                message: 'Login fallito',
                error: 'missing_username',
                details: 'Username mancante. Inserisci il tuo nome utente per accedere.'
            });
            return;
        }
        if (!password) {
            res.status(400).json({
                message: 'Login fallito',
                error: 'missing_password',
                details: 'Password mancante. Inserisci la tua password per accedere.'
            });
            return;
        }
        // Verifica che la password sia una stringa
        if (typeof password !== 'string') {
            res.status(400).json({
                message: 'Login fallito',
                error: 'invalid_password_format',
                details: 'Il formato della password non è valido. La password deve essere una stringa di testo.'
            });
            return;
        }
        // Trova l'utente tramite username o email, ma NON escludere il campo password per il controllo
        const user = yield user_model_1.default.findOne({
            $or: [
                { username: username }, // Cerca per username
                { email: username } // Cerca anche per email (assumendo che l'input possa essere l'email)
            ]
        });
        if (!user) {
            res.status(401).json({
                message: 'Login fallito',
                error: 'invalid_credentials',
                details: 'Nessun utente trovato con le credenziali fornite.'
            });
            return;
        }
        // Aggiungi debug per verificare lo stato della password
        console.log('Debug Login - User trovato:', {
            userId: user._id,
            username: user.username,
            email: user.email,
            hasPassword: !!user.password,
            passwordLength: user.password ? user.password.length : 0,
            verified: user.verified
        });
        // Verifica la password
        const isMatch = yield user.comparePassword(password);
        console.log('Debug Login - Risultato comparePassword:', isMatch);
        if (!isMatch) {
            res.status(401).json({
                message: 'Login fallito',
                error: 'invalid_credentials',
                details: 'Credenziali errate.'
            });
            return;
        }
        // Verifica che l'account sia stato verificato
        if (!user.verified) {
            res.status(403).json({
                message: 'Login fallito',
                error: 'account_not_verified',
                details: 'Il tuo account non è stato verificato. Controlla la tua email per il link di verifica o utilizza l\'opzione "Richiedi nuovo link di verifica" nella pagina di login.'
            });
            return;
        }
        // Genera il token JWT (se la password è corretta)
        if (typeof process.env.JWT_SECRET !== 'string') {
            console.warn('JWT_SECRET non definito correttamente. Usando un valore predefinito.');
            process.env.JWT_SECRET = 'default_jwt_secret_key';
        }
        const jwtOptions = {
            expiresIn: (process.env.JWT_EXPIRES_IN || '1d')
        };
        // Firma il token
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET, jwtOptions);
        // Creiamo una versione dell'utente senza campi sensibili usando destrutturazione
        const _a = user.toObject(), { password: _, // Escludi la password
        verificationToken: __, verificationTokenExpires: ___, resetPasswordToken: ____, resetPasswordExpires: _____, __v: ______ } = _a, userResponse = __rest(_a, ["password", "verificationToken", "verificationTokenExpires", "resetPasswordToken", "resetPasswordExpires", "__v"]);
        res.status(200).json({
            message: 'Login effettuato con successo',
            token,
            user: userResponse
        });
    }
    catch (error) {
        console.error('Errore durante il login:', error);
        // Gestisci i diversi tipi di errori
        if (error.name === 'ValidationError') {
            res.status(400).json({
                message: 'Login fallito',
                error: 'validation_error',
                details: error.message || 'Errore di validazione durante il login.'
            });
            return;
        }
        res.status(500).json({
            message: 'Errore del server durante il login',
            error: 'server_error',
            details: error.message || 'Si è verificato un errore interno. Riprova più tardi.'
        });
    }
});
exports.login = login;
