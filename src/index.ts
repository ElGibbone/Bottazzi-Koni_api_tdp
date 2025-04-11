import express from 'express';
import dotenv from 'dotenv';
import cluster from 'cluster'; // Import cluster
import os from 'os'; // Import os
import compression from 'compression'; // Import compression
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import passwordRoutes from './routes/password.routes';
import emailRoutes from './routes/email.routes';
import { initializeDatabase } from './utils/db.utils';

// Carica le variabili d'ambiente
dotenv.config();

const numCPUs = os.cpus().length; // Ottieni il numero di core della CPU

if (cluster.isPrimary) { // Verifica se è il processo master (Node >= v16)
  console.log(`Master ${process.pid} is running`);

  // Crea un worker per ogni CPU
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Forking a new worker...`);
    cluster.fork(); // Riavvia il worker se crasha
  });

} else {
  // Questo è un processo worker, esegue il codice del server
  console.log(`Worker ${process.pid} started`);

  // Inizializza l'app Express
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Middleware per il parsing del JSON
  app.use(express.json());

  // Middleware per la compressione Gzip
  app.use(compression());

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
      console.log(`Worker ${process.pid}: Connessione al database MongoDB stabilita con successo`);
      
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
        console.log(`Worker ${process.pid} server in esecuzione sulla porta ${PORT}`);
      });
    })
    .catch((error) => {
      console.error(`Worker ${process.pid}: Errore durante la connessione al database:`, error);
      process.exit(1); // Termina il worker in caso di errore di connessione al DB
    });
}