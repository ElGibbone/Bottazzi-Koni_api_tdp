"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const password_routes_1 = __importDefault(require("./routes/password.routes"));
const email_routes_1 = __importDefault(require("./routes/email.routes"));
// Carica le variabili d'ambiente
dotenv_1.default.config();
// Inizializza l'app Express
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware per il parsing del JSON
app.use(express_1.default.json());
// Middleware per abilitare CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    // Per le richieste OPTIONS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});
// Connessione al database MongoDB
mongoose_1.default.connect(process.env.MONGODB_URI)
    .then(() => {
    console.log('Connessione al database MongoDB stabilita con successo');
})
    .catch((error) => {
    console.error('Errore durante la connessione al database:', error);
    process.exit(1);
});
// Definizione delle rotte
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/password', password_routes_1.default);
app.use('/api/email', email_routes_1.default);
// Rotta di base per verificare che il server funzioni
app.get('/', (req, res) => {
    res.send('API del servizio di autenticazione funzionante');
});
// Avvio del server
app.listen(PORT, () => {
    console.log(`Server in esecuzione sulla porta ${PORT}`);
});
