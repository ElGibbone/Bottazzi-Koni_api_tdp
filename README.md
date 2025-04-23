# Per avviare l'api 

per il primo avvio:
   - npm install
   - npm run dev

per avviarlo ogni volta:
   - npm start


# Servizio di Autenticazione API

Un servizio completo di autenticazione sviluppato in TypeScript con MongoDB che offre:
- Registrazione utenti con validazione avanzata
- Login sicuro con username/password
- Gestione delle sessioni JWT
- Ruoli utente avanzati (utente, moderatore, amministratore)
- Verifica email con doppio fattore
- Recupero password sicuro
- Dashboard per ruoli specifici

Tutte le comunicazioni sono protette e i dati sensibili vengono crittografati.

## Funzionalità Avanzate

### Autenticazione Base
- ✅ Registrazione utenti con validazione multi-livello
- ✅ Login sicuro con protezione brute-force
- ✅ Hashing password con bcrypt (12 round)

### Gestione Sessioni
- 🔐 Generazione token JWT con scadenza configurabile
- 🛡️ Middleware di autenticazione per tutte le rotte protette
- 🔄 Refresh token automatico

### Sicurezza Avanzata
- ✉️ Verifica email con doppio fattore
- 🔄 Recupero password con token temporanei
- 📧 Notifiche email per attività sospette

### Ruoli e Permessi
- 👤 Utente: accesso base
- 👮 Moderatore: gestione contenuti
- 👑 Amministratore: gestione completa

### Extra Features
- 📊 Dashboard personalizzate per ruolo
- 📝 Log attività dettagliati
- ⚙️ Configurazione flessibile

## Requisiti

- Node.js (v14 o superiore)
- MongoDB
- npm o yarn

## Installazione

1. Clona il repository
2. Installa le dipendenze:
   ```
   npm install
   ```
3. Configura le variabili d'ambiente creando un file `.env` nella root del progetto (vedi sezione [Configurazione](#configurazione) sotto).

## Avvio del server

### Modalità sviluppo
```
npm run dev
```

### Modalità produzione
```
npm run build
npm start
```

## API Endpoints

### Autenticazione

#### Registrazione
```
POST /api/auth/register
```
Body:
```json
{
  "username": "mario_rossi",
  "email": "mario.rossi@example.com",
  "password": "S3cur3P@ssw0rd"
}
```
Risposte:
- **201 Created**: Utente registrato con successo. Email di verifica inviata.
```json
{
  "message": "Utente registrato con successo. Controlla la tua email per verificare il tuo account.",
  "token": "...", // Token JWT per l'utente
  "user": { ... } // Dettagli utente (senza password/token)
}
```
- **400 Bad Request**: Dati non validi (es. email già in uso, password non complessa).
```json
{
  "message": "Registrazione fallita",
  "error": "email_already_exists",
  "details": "Email già in uso. Utilizza un altro indirizzo email."
}
```

#### Login
```
POST /api/auth/login
```
Body:
```json
{
  "username": "mario.rossi@example.com", // Può essere username o email
  "password": "S3cur3P@ssw0rd"
}
```
Risposte:
- **200 OK**: Login effettuato con successo.
```json
{
  "message": "Login effettuato con successo",
  "token": "...",
  "user": { ... } // Dettagli utente (senza password/token)
}
```
- **401 Unauthorized**: Credenziali non valide.
- **403 Forbidden**: Account non verificato.

### Verifica Email

#### Richiesta Nuova Email di Verifica (Utente Autenticato)
```
POST /api/email/resend-verification
```
Header:
```
Authorization: Bearer <token>
```
Risposte:
- **200 OK**: Email di verifica inviata con successo.
- **400 Bad Request**: Account già verificato.
- **401 Unauthorized**: Utente non autenticato.
- **404 Not Found**: Utente non trovato.

#### Conferma Email (Link dall'Email)
```
GET /api/email/confirm/:token
```
Risposte:
- **200 OK**: Email verificata con successo.
```json
{
  "message": "Email verificata con successo",
  "verified": true
}
```
- **400 Bad Request**: Token non valido o scaduto.

### Gestione Password

#### Richiesta Reset Password (Utente non autenticato)
```
POST /api/password/request-reset
```
Body:
```json
{
  "email": "mario.rossi@example.com"
}
```
Risposte:
- **200 OK**: Email di reset inviata (se l'email esiste).
- **400 Bad Request**: Email mancante o formato non valido.

#### Verifica Token di Reset (Usato dal Frontend)
```
GET /api/password/verify-token/:token
```
Risposte:
- **200 OK**: Token valido.
```json
{
  "message": "Token di reset valido",
  "valid": true
}
```
- **400 Bad Request**: Token non valido o scaduto.

#### Reset Password con Token (Usato dal Frontend)
```
POST /api/password/reset/:token
```
Body:
```json
{
  "password": "NuovaP@ssw0rd1",
  "confirmPassword": "NuovaP@ssw0rd1"
}
```
Risposte:
- **200 OK**: Password reimpostata con successo.
- **400 Bad Request**: Token non valido, password non corrispondenti o non conformi.

#### Cambio Password (Utente Autenticato)
```
POST /api/password/change
```
Header:
```
Authorization: Bearer <token>
```
Body:
```json
{
  "currentPassword": "S3cur3P@ssw0rd",
  "newPassword": "NuovaP@ssw0rd1",
  "confirmPassword": "NuovaP@ssw0rd1"
}
```
Risposte:
- **200 OK**: Password cambiata con successo.
- **400 Bad Request**: Campi mancanti, nuove password non corrispondenti o non conformi.
- **401 Unauthorized**: Password attuale errata.

### Gestione Utente

#### Ottenere Profilo Utente
```
GET /api/users/profile
```
Header:
```
Authorization: Bearer <token>
```
Risposte:
- **200 OK**: Profilo utente restituito.
```json
{
  "message": "Profilo utente recuperato con successo",
  "user": { ... } // Dettagli utente (senza password/token)
}
```
- **401 Unauthorized**: Token non valido o scaduto.

#### Aggiornare Profilo Utente
```
PUT /api/users/profile
```
Header:
```
Authorization: Bearer <token>
```
Body:
```json
{
  "name": "Mario Rossi Aggiornato",
  "email": "m.rossi.new@example.com"
}
```
Risposte:
- **200 OK**: Profilo aggiornato con successo.
```json
{
  "message": "Profilo aggiornato con successo",
  "user": { ... } // Dettagli utente aggiornati
}
```
- **400 Bad Request**: Formato email non valido.
- **401 Unauthorized**: Token non valido o scaduto.

#### Eliminare Account Utente
```
DELETE /api/users/account
```
Header:
```
Authorization: Bearer <token>
```
Risposte:
- **200 OK**: Account eliminato con successo.
```json
{
  "message": "Account eliminato con successo",
  "success": true
}
```
- **401 Unauthorized**: Token non valido o scaduto.
- **404 Not Found**: Utente non trovato.

### Amministrazione (Richiede Ruolo Admin)

#### Ottenere Tutti gli Utenti
```
GET /api/auth/users
```
Header:
```
Authorization: Bearer <token>
```
Risposte:
- **200 OK**: Lista di tutti gli utenti.
```json
{
  "message": "Lista utenti recuperata con successo",
  "users": [ { ... }, { ... } ] // Array di oggetti utente (senza password/token)
}
```
- **401 Unauthorized**: Token non valido o scaduto.
- **403 Forbidden**: Permessi insufficienti (non admin).

#### Aggiornare Ruolo Utente
```
PUT /api/auth/users/role
```
Header:
```
Authorization: Bearer <token>
```
Body:
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "role": "moderator"
}
```
Risposte:
- **200 OK**: Ruolo utente aggiornato.
```json
{
  "message": "Ruolo utente aggiornato con successo",
  "user": { ... } // Dettagli utente aggiornati
}
```
- **400 Bad Request**: Ruolo non valido.
- **401 Unauthorized**: Token non valido o scaduto.
- **403 Forbidden**: Permessi insufficienti (non admin).
- **404 Not Found**: Utente specificato non trovato.

## Gestione degli Errori

Tutte le risposte di errore dell'API seguono un formato standard per facilitare il debug e migliorare l'esperienza utente:

```json
{
  "message": "Descrizione generale dell'errore",
  "error": "codice_errore_specifico",
  "details": "Informazioni dettagliate sull'errore o suggerimenti per risolverlo"
}
```

### Codici di Errore

#### Errori di Autenticazione
- `missing_data`: Dati obbligatori non forniti nella richiesta
- `missing_fields`: Campi specifici mancanti (username, email, password)
- `missing_credentials`: Credenziali di login mancanti
- `invalid_credentials`: Username o password non corretti
- `account_not_verified`: L'account esiste ma non è stato verificato
- `password_verification_error`: Errore durante la verifica della password

#### Errori di Registrazione
- `username_already_exists`: L'username scelto è già in uso
- `email_already_exists`: L'email inserita è già registrata
- `invalid_email_format`: Formato email non valido
- `invalid_password`: La password non è una stringa valida
- `password_too_short`: Password troppo corta (minimo 6 caratteri)
- `password_complexity`: La password non soddisfa i requisiti di complessità
- `username_too_short`: Username troppo corto (minimo 3 caratteri)

#### Errori di Validazione
- `validation_error`: Errore di validazione Mongoose
- `invalid_role`: Ruolo specificato non valido
- `invalid_password_format`: Formato password non valido

#### Errori generali
- `user_not_found`: Utente non trovato
- `server_error`: Errore interno del server

### Esempi di Errori Comuni

**Registrazione con username già in uso:**
```json
{
  "message": "Registrazione fallita",
  "error": "username_already_exists",
  "details": "Username già in uso. Scegli un altro username."
}
```

**Login con account non verificato:**
```json
{
  "message": "Login fallito", 
  "error": "account_not_verified",
  "details": "Il tuo account non è stato verificato. Controlla la tua email per il link di verifica o utilizza l'opzione \"Richiedi nuovo link di verifica\" nella pagina di login."
}
```

**Password non conforme ai requisiti di sicurezza:**
```json
{
  "message": "Registrazione fallita", 
  "error": "password_complexity",
  "details": "La password non soddisfa i requisiti di sicurezza. Manca: una lettera maiuscola, un numero."
}
```

**Email con formato non valido:**
```json
{
  "message": "Registrazione fallita", 
  "error": "invalid_email_format",
  "details": "Formato email non valido. L'indirizzo email deve contenere il simbolo @ e un dominio valido (esempio: user@domain.com)."
}
```

**Password troppo corta:**
```json
{
  "message": "Registrazione fallita", 
  "error": "password_too_short",
  "details": "La password è troppo corta. Deve contenere almeno 6 caratteri. Hai inserito solo 4 caratteri."
}
```

**Username non trovato durante il login:**
```json
{
  "message": "Login fallito", 
  "error": "invalid_credentials",
  "details": "Nessun utente trovato con il nome utente \"username_errato\". Verifica di aver inserito il nome utente corretto."
}
```

**Password errata durante il login:**
```json
{
  "message": "Login fallito", 
  "error": "invalid_credentials",
  "details": "Password non corretta. Verifica che la password inserita sia corretta. Ricorda che le password distinguono tra maiuscole e minuscole."
}
```

## Configurazione dell'ambiente di sviluppo

1. Assicurati di avere Node.js e MongoDB installati.
2. Clona il repository e installa le dipendenze con `npm install`.
3. Configura le variabili d'ambiente nel file `.env`.
4. Avvia il server in modalità sviluppo con `npm run dev`.

## Test dell'API localmente

Utilizza strumenti come Postman per inviare richieste HTTP agli endpoint dell'API.

## Sicurezza

- Le password vengono hashate prima di essere salvate nel database
- I token JWT hanno una scadenza configurabile
- Validazione dei dati in ingresso
- Protezione delle rotte sensibili tramite middleware di autenticazione
- Autorizzazioni basate sui ruoli per accesso alle risorse

## Best practice per la sicurezza

- Non condividere il tuo JWT_SECRET.
- Utilizza HTTPS per proteggere le comunicazioni.
- Aggiorna regolarmente le dipendenze per evitare vulnerabilità.
- Limita i permessi in base al principio del minimo privilegio.
- Proteggi le rotte amministrative con middleware di controllo ruoli.

## Permessi Associati ai Ruoli

- **Utente**: Accesso al profilo utente.
- **Moderatore**: Accesso alla dashboard moderatore.
- **Amministratore**: Accesso alla dashboard admin e gestione utenti.

## Configurazione

Crea un file `.env` nella root del progetto e configura le seguenti variabili d'ambiente:

```dotenv
# Configurazione Server
PORT=3000                 # Porta su cui il server API ascolterà

# Configurazione MongoDB
MONGODB_URI=mongodb://localhost:27017/auth-service  # URI di connessione al database MongoDB

# Configurazione JWT (JSON Web Token)
JWT_SECRET=your_strong_jwt_secret_key  # Chiave segreta per firmare i token JWT (cambia questa!)
JWT_EXPIRES_IN=1d                      # Durata di validità del token (es. 1d, 7d, 1h)

# Configurazione Email (Nodemailer)
EMAIL_HOST=smtp.example.com     # Host del server SMTP (es. smtp.gmail.com)
EMAIL_PORT=587                  # Porta del server SMTP (es. 587 per TLS, 465 per SSL)
EMAIL_SECURE=false              # true se usi la porta 465 (SSL), false per TLS (porta 587)
EMAIL_USER=your_email@example.com # Il tuo indirizzo email
EMAIL_PASS=your_email_password    # La password del tuo account email (vedi sotto per Gmail)
EMAIL_FROM="Nome App" <your_email@example.com> # Mittente visualizzato nelle email

# URL del Frontend (usati nelle email)
VERIFY_EMAIL_URL=http://localhost:5173/verify-email # URL della pagina di verifica email nel frontend
RESET_PASSWORD_URL=http://localhost:5173/reset-password # URL della pagina di reset password nel frontend
```

### Configurazione Email con Gmail

Se desideri utilizzare un account Gmail per inviare le email:

1.  **Abilita l'Accesso da App Meno Sicure (Sconsigliato) o usa una Password per le App (Consigliato):**
    *   **Metodo Sconsigliato:** Se il tuo account Gmail *non* ha l'autenticazione a due fattori (2FA) attiva, potresti dover abilitare "Accesso app meno sicure" nelle impostazioni di sicurezza del tuo account Google. **Questo riduce la sicurezza del tuo account.**
    *   **Metodo Consigliato (con 2FA):** Se hai l'autenticazione a due fattori (2FA) attiva sul tuo account Gmail (cosa altamente raccomandata), **devi** generare una "**Password per le app**".
        1.  Vai alle [impostazioni di sicurezza del tuo Account Google](https://myaccount.google.com/security).
        2.  Assicurati che l'autenticazione a due fattori sia **Attiva**.
        3.  Nella sezione "Accesso a Google", cerca "Password per le app".
        4.  Potrebbe essere necessario inserire nuovamente la password del tuo account.
        5.  Nella sezione "Seleziona app", scegli "Altra (nome personalizzato)".
        6.  Inserisci un nome (es. "API Autenticazione Nodejs") e clicca su "Genera".
        7.  Verrà mostrata una password di 16 caratteri. **Copia questa password**. Questa è la password che userai per `EMAIL_PASS`.
        8.  **Importante:** Salva questa password in modo sicuro, non potrai visualizzarla di nuovo.

2.  **Configura le variabili `.env` per Gmail:**

    ```dotenv
    EMAIL_HOST=smtp.gmail.com
    EMAIL_PORT=587
    EMAIL_SECURE=false  # TLS è usato sulla porta 587
    EMAIL_USER=tuoindirizzo@gmail.com
    EMAIL_PASS=la_tua_password_per_le_app_di_16_caratteri # O la password normale se NON usi 2FA
    EMAIL_FROM="La Tua App" <tuoindirizzo@gmail.com>
    ```

**Nota:** Assicurati che il file `.env` sia incluso nel tuo file `.gitignore` per evitare di committare credenziali sensibili nel repository Git.

## Avvio

1.  Installa le dipendenze:
    ```bash
    npm install
    ```
2.  Compila il codice TypeScript (se necessario, in base al tuo flusso di lavoro):
    ```bash
    npm run build
    ```
3.  Avvia il server API:
    ```bash
    npm start
    ```
    Oppure, per lo sviluppo con hot-reloading (se configurato con `nodemon` o simili):
    ```bash
    npm run dev
    ```

Il server API sarà disponibile all'indirizzo `http://localhost:PORT` (dove `PORT` è il valore specificato nel file `.env` o 3000 di default).

## Endpoint API

Consulta la documentazione Postman o il codice sorgente per i dettagli sugli endpoint disponibili.

*(Sezione Endpoint API attuale...)*

## Contribuzione

Le pull request sono benvenute. Per modifiche importanti, si prega di aprire prima un issue per discutere ciò che si desidera cambiare.

Assicurati di aggiornare i test, se applicabile.

## Licenza

[MIT](https://choosealicense.com/licenses/mit/)
