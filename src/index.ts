import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import passwordRoutes from './routes/password.routes';
import emailRoutes from './routes/email.routes';
import { initializeDatabase } from './utils/db.utils';

// Carica le variabili d'ambiente
dotenv.config();

// Inizializza l'app Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware per il parsing del JSON
app.use(express.json());

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
initializeDatabase()
  .then(() => {
    console.log('Connessione al database MongoDB stabilita con successo');
    
    // Definizione delle rotte
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/password', passwordRoutes);
    app.use('/api/email', emailRoutes);
    
    // Rotta di base per verificare che il server funzioni
    app.get('/', (req, res) => {
      res.send('API del servizio di autenticazione funzionante');
    });
    
    // Avvio del server
    app.listen(PORT, () => {
      console.log(`Server in esecuzione sulla porta ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Errore durante la connessione al database:', error);
    process.exit(1);
  });