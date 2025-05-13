const { MongoClient } = require('mongodb');

// Stringa di connessione MongoDB
const uri = 'mongodb://localhost:27017/auth-service';

async function deleteAllUsers() {
  let client;
  
  try {
    // Connessione al database
    console.log('Connessione al database in corso...');
    client = new MongoClient(uri);
    await client.connect();
    console.log('Connesso al database con successo');
    
    // Ottieni il database
    const database = client.db('auth-service');
    
    // Elenca tutte le collezioni
    console.log('Elenco di tutte le collezioni nel database:');
    const collections = await database.listCollections().toArray();
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Trova la collezione degli utenti (potrebbe essere 'users' o 'Users')
    let usersCollection = 'users';
    if (collections.some(c => c.name === 'Users')) {
      usersCollection = 'Users';
    }
    
    console.log(`Utilizzo della collezione: ${usersCollection}`);
    const users = database.collection(usersCollection);
    
    // Conta gli utenti
    console.log('Conteggio degli utenti...');
    const count = await users.countDocuments();
    console.log(`Numero di utenti trovati: ${count}`);
    
    if (count > 0) {
      // Elimina tutti gli utenti
      console.log('Eliminazione degli utenti in corso...');
      const result = await users.deleteMany({});
      console.log(`Eliminati ${result.deletedCount} utenti`);
    } else {
      console.log('Non ci sono utenti da eliminare');
    }
    
  } catch (error) {
    console.error('Errore durante l\'operazione:');
    console.error(error.name + ': ' + error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Chiudi la connessione
    if (client) {
      await client.close();
      console.log('Connessione al database chiusa');
    }
  }
}

// Esegui la funzione
deleteAllUsers().catch(err => {
  console.error('Errore non gestito:', err);
}); 