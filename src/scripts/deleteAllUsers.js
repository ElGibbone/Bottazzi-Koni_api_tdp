const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '../../.env' });

// Utilizza direttamente la stringa di connessione
const mongoURI = 'mongodb://localhost:27017/auth-service';

async function deleteAllUsers() {
  const client = new MongoClient(mongoURI);
  
  try {
    await client.connect();
    console.log('Connesso al database MongoDB');
    
    const db = client.db();
    
    // Ottieni tutte le collezioni
    const collections = await db.listCollections().toArray();
    console.log('Collezioni trovate:', collections.map(c => c.name).join(', '));
    
    // Controlla la collezione 'users'
    const users = db.collection('users');
    const userCount = await users.countDocuments({});
    console.log(`Collezione 'users': ${userCount} documenti trovati`);
    
    if (userCount > 0) {
      const result = await users.deleteMany({});
      console.log(`${result.deletedCount} utenti eliminati dalla collezione 'users'`);
    } else {
      console.log(`Nessun utente da eliminare nella collezione 'users'`);
    }
    
  } catch (error) {
    console.error('Errore durante l\'operazione:', error);
  } finally {
    await client.close();
    console.log('Connessione al database chiusa');
  }
}

// Esegui la funzione
deleteAllUsers(); 