const { MongoClient } = require('mongodb');

// Utilizza direttamente la stringa di connessione
const mongoURI = 'mongodb://localhost:27017/auth-service';

async function listCollections() {
  const client = new MongoClient(mongoURI);
  
  try {
    await client.connect();
    console.log('Connesso al database MongoDB');
    
    const db = client.db();
    
    console.log('Elenco delle collezioni nel database:');
    const collections = await db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log('Non sono state trovate collezioni nel database');
    } else {
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
    }
    
    // Prova a controllare anche la collezione 'User' (senza 's')
    console.log('\nVerifica collezioni specifiche:');
    const userCollection = await db.collection('User').countDocuments();
    console.log(`'User' (senza 's'): ${userCollection} documenti`);
    
    const usersCollection = await db.collection('users').countDocuments();
    console.log(`'users' (con 's'): ${usersCollection} documenti`);
    
  } catch (error) {
    console.error('Errore durante l\'operazione:', error);
  } finally {
    await client.close();
    console.log('Connessione al database chiusa');
  }
}

// Esegui la funzione
listCollections(); 