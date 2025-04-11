import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Token di autenticazione
let authToken: string | null = null;

// Configurazione di Axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false // Imposta su true se vuoi inviare i cookie
});

// Interceptor per aggiungere il token alle richieste
api.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor per gestire le risposte
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gestione degli errori comuni
    if (error.response) {
      // La richiesta è stata effettuata e il server ha risposto con un codice di stato
      console.error('Errore dal server:', error.response.status, error.response.data);
    } else if (error.request) {
      // La richiesta è stata effettuata ma non è stata ricevuta alcuna risposta
      console.error('Nessuna risposta dal server:', error.request);
    } else {
      // Si è verificato un errore durante l'impostazione della richiesta
      console.error('Errore di configurazione:', error.message);
    }
    return Promise.reject(error);
  }
);

// Salva il token
export const setToken = (token: string) => {
  authToken = token;
  localStorage.setItem('auth_token', token);
};

// Recupera il token dal local storage
export const getToken = (): string | null => {
  if (!authToken) {
    authToken = localStorage.getItem('auth_token');
  }
  return authToken;
};

// Rimuovi il token
export const removeToken = () => {
  authToken = null;
  localStorage.removeItem('auth_token');
};

// Servizi di autenticazione
export const authServices = {
  register: (userData: any) => api.post('/auth/register', userData),
  login: (credentials: any) => api.post('/auth/login', credentials),
  verifyAccount: (token: string) => api.get(`/email/verify/${token}`),
  logout: () => {
    removeToken();
    return Promise.resolve();
  },
};

// Servizi utente
export const userServices = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  deleteAccount: () => api.delete('/users/account'),
  getAllUsers: () => api.get('/users'),
};

// Servizi per la gestione della password
export const passwordServices = {
  requestReset: (email: string) => api.post('/password/request-reset', { email }),
  verifyResetToken: (token: string) => api.get(`/password/verify-token/${token}`),
  resetPassword: (token: string, data: object) => api.post(`/password/reset/${token}`, data),
  changePassword: (data: any) => api.post('/password/change', data),
};

// Servizi email
export const emailServices = {
  verifyEmail: (token: string) => api.get(`/email/confirm/${token}`),
  resendVerification: () => api.post('/email/resend-verification'),
};

export default {
  auth: authServices,
  user: userServices,
  password: passwordServices,
  email: emailServices,
}; 