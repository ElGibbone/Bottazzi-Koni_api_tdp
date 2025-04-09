# Client per il Test delle API di Autenticazione

Questo è un client React progettato per testare le API di autenticazione fornite dal server. Permette di testare tutte le funzionalità dell'API in modo semplice e intuitivo.

## Funzionalità

- **Autenticazione**: Test delle API di registrazione, login e logout.
- **Gestione Utenti**: Test delle API per visualizzare il profilo, aggiornare i dati e cancellare l'account.
- **Gestione Password**: Test delle API per il reset e il cambio della password.
- **Verifica Email**: Test delle API per verificare l'email e richiedere una nuova email di verifica.

## Requisiti

- Node.js (v14 o superiore)
- NPM (v7 o superiore)

## Installazione

1. Assicurati che il server API sia in esecuzione sulla porta 3000.
2. Installa le dipendenze:

```bash
npm install
```

## Avvio dell'applicazione

Per avviare l'applicazione in modalità sviluppo:

```bash
npm start
```

L'applicazione sarà disponibile all'indirizzo [http://localhost:8080](http://localhost:8080).

## Build per la produzione

Per creare una build di produzione:

```bash
npm run build
```

I file generati saranno nella cartella `dist`.

## Struttura del progetto

- `src/`: Codice sorgente dell'applicazione
  - `components/`: Componenti React riutilizzabili
  - `pages/`: Pagine principali dell'applicazione
  - `services/`: Servizi per interagire con le API
- `public/`: File statici

## Utilizzo

1. Avvia prima il server API su http://localhost:3000
2. Avvia il client con `npm start`
3. Naviga tra le diverse sezioni per testare le varie funzionalità delle API:
   - **Home**: Panoramica delle funzionalità disponibili e stato del server
   - **Autenticazione**: Registrazione e login
   - **Utenti**: Gestione del profilo utente
   - **Password**: Reset e cambio password
   - **Email**: Verifica dell'indirizzo email

## Note

- Tutte le richieste alle API vengono effettuate verso il server in esecuzione su http://localhost:3000
- I risultati delle richieste API vengono visualizzati in tempo reale nell'interfaccia
- Il token di autenticazione viene salvato nel localStorage per mantenere la sessione 