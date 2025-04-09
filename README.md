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
3. Configura le variabili d'ambiente nel file `.env`:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/auth-service
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=1d
   
   # Configurazione Email
   EMAIL_HOST=smtp.example.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your_email_user
   EMAIL_PASS=your_email_password
   EMAIL_FROM=noreply@example.com
   RESET_PASSWORD_URL=http://localhost:3000/reset-password
   VERIFY_EMAIL_URL=http://localhost:3000/verify-email
   ```

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

**Esempio completo:**
```json
{
  "username": "mario_rossi",
  "email": "mario.rossi@example.com",
  "password": "S3cur3P@ssw0rd"
}
```

**Validazioni:**
- Username: 3-20 caratteri (lettere, numeri, underscore)
- Email: formato valido
- Password: 8+ caratteri, 1 maiuscola, 1 numero, 1 speciale

**Risposte:**
- **201 Created**: Utente registrato con successo
```json
{
  "message": "Registrazione completata",
  "userId": "507f1f77bcf86cd799439011"
}
```
- **400 Bad Request**: Dati non validi
```json
{
  "error": "Username già in uso",
  "details": ["username"]
}
```

#### Login
```
POST /api/auth/login
```

**Esempio completo:**
```json
{
  "username": "mario_rossi",
  "password": "S3cur3P@ssw0rd"
}
```

**Protezioni:**
- Rate limiting (5 tentativi/15 minuti)
- Blocco temporaneo dopo troppi tentativi

**Risposte:**
- **200 OK**: Login effettuato con successo
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400,
  "role": "user",
  "emailVerified": true
}
```
- **401 Unauthorized**: Credenziali non valide
```json
{
  "error": "Credenziali non valide",
  "remainingAttempts": 2
}
```

#### Verifica Email
```
POST /api/email/verify
```
Body:
```json
{
  "email": "example@example.com"
}
```
Risposte:
- **200 OK**: Email di verifica inviata con successo
```json
{
  "message": "Email di verifica inviata con successo",
  "email": "example@example.com"
}
```
- **400 Bad Request**: Email non valida o già verificata
```json
{
  "message": "Invio email fallito",
  "error": "already_verified",
  "details": "L'account è già verificato."
}
```
- **404 Not Found**: Utente non trovato
```json
{
  "message": "Invio email fallito",
  "error": "user_not_found",
  "details": "Utente non trovato."
}
```

#### Conferma Email
```
GET /api/email/confirm/:token
```
Risposte:
- **200 OK**: Email verificata con successo
```json
{
  "message": "Email verificata con successo",
  "verified": true
}
```
- **400 Bad Request**: Token non valido o scaduto
```json
{
  "message": "Verifica fallita",
  "error": "invalid_or_expired_token",
  "details": "Token di verifica non valido o scaduto."
}
```

### Recupero Password

#### Richiesta di reset password
```
POST /api/password/request-reset
```
Body:
```json
{
  "email": "example@example.com"
}
```
Risposte:
- **200 OK**: Email di reset inviata (se l'email esiste nel sistema).
- **400 Bad Request**: Email non valida o mancante.

#### Verifica token di reset
```
GET /api/password/verify-token/:token
```
Risposte:
- **200 OK**: Token valido.
- **400 Bad Request**: Token non valido o scaduto.

#### Reset della password
```
POST /api/password/reset/:token
```
Body:
```json
{
  "password": "NewPassword123",
  "confirmPassword": "NewPassword123"
}
```
Risposte:
- **200 OK**: Password reimpostata con successo.
- **400 Bad Request**: Token non valido, password non corrispondenti o non conformi ai requisiti.

### Gestione dei Ruoli Utente

#### Profilo utente
```
GET /api/users/profile
```
Header:
```
Authorization: Bearer <token>
```
Risposte:
- **200 OK**: Profilo utente restituito con ruolo.
```json
{
  "username": "example",
  "email": "example@example.com",
  "role": "user"
}
```
- **401 Unauthorized**: Token non valido o scaduto.

#### Dashboard Moderatore
```
GET /api/users/moderator-dashboard
```
Header:
```
Authorization: Bearer <token>
```
Risposte:
- **200 OK**: Accesso consentito per moderatori e amministratori.
- **403 Forbidden**: Permessi insufficienti.

#### Dashboard Amministratore
```
GET /api/users/admin-dashboard
```
Header:
```
Authorization: Bearer <token>
```
Risposte:
- **200 OK**: Accesso consentito solo per amministratori.
- **403 Forbidden**: Permessi insufficienti.

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