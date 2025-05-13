"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cluster_1 = __importDefault(require("cluster")); // Import cluster
const os_1 = __importDefault(require("os")); // Import os
const compression_1 = __importDefault(require("compression")); // Import compression
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const password_routes_1 = __importDefault(require("./routes/password.routes"));
const email_routes_1 = __importDefault(require("./routes/email.routes"));
const db_utils_1 = require("./utils/db.utils");
// Carica le variabili d'ambiente
dotenv_1.default.config();
const numCPUs = os_1.default.cpus().length; // Ottieni il numero di core della CPU
if (cluster_1.default.isPrimary) { // Verifica se è il processo master (Node >= v16)
    console.log(`Master ${process.pid} is running`);
    // Crea un worker per ogni CPU
    for (let i = 0; i < numCPUs; i++) {
        cluster_1.default.fork();
    }
    cluster_1.default.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died. Forking a new worker...`);
        cluster_1.default.fork(); // Riavvia il worker se crasha
    });
}
else {
    // Questo è un processo worker, esegue il codice del server
    console.log(`Worker ${process.pid} started`);
    // Inizializza l'app Express
    const app = (0, express_1.default)();
    const PORT = process.env.PORT || 3000;
    // Middleware per il parsing del JSON
    app.use(express_1.default.json());
    // Middleware per la compressione Gzip
    app.use((0, compression_1.default)());
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
    (0, db_utils_1.initializeDatabase)()
        .then(() => {
        console.log(`Worker ${process.pid}: Connessione al database MongoDB stabilita con successo`);
        // Definizione delle rotte
        app.use('/api/auth', auth_routes_1.default);
        app.use('/api/users', user_routes_1.default);
        app.use('/api/password', password_routes_1.default);
        app.use('/api/email', email_routes_1.default);
        // Rotta di base per verificare che il server funzioni
        app.get('/', (req, res) => {
            res.send('API del servizio di autenticazione funzionante');
        });
        // Gestione degli errori 404 per le API
        app.all('/api/*', (req, res) => {
            res.status(404).json({
                message: 'Endpoint non trovato',
                error: 'not_found',
                details: `L'endpoint ${req.originalUrl} non esiste o il metodo ${req.method} non è supportato.`
            });
        });
        // Avvio del server
        app.listen(PORT, () => {
            console.log(`Worker ${process.pid} server in esecuzione sulla porta ${PORT}`);
        });
    })
        .catch((error) => {
        console.error(`Worker ${process.pid}: Errore durante la connessione al database:`, error);
        process.exit(1); // Termina il worker in caso di errore di connessione al DB
    });
}
