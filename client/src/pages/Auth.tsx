import React, { useState } from 'react';
import ApiResponse from '../components/ApiResponse';
import { authServices, setToken, getToken, removeToken } from '../services/api';

const Auth: React.FC = () => {
  // Stati per il form di registrazione
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: ''
  });
  
  // Stati per il form di login
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  
  // Stati per la risposta dell'API
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Controlla se l'utente è già loggato
  const [isLoggedIn, setIsLoggedIn] = useState(!!getToken());

  // Aggiungi questi stati e funzioni
  const [verifyToken, setVerifyToken] = useState('');

  // Gestisce la modifica dei campi nel form di registrazione
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value
    });
  };

  // Gestisce la modifica dei campi nel form di login
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  // Gestisce l'invio del form di registrazione
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setErrorDetails(null);
    
    try {
      console.log("Dati registrazione inviati:", registerData);
      const response = await authServices.register(registerData);
      setResult(response.data);
      setRegisterData({ username: '', email: '', password: '' });
      
      // Mostra un messaggio specifico se sono presenti informazioni di verifica
      if (response.data.verificationInfo) {
        setResult({
          ...response.data,
          message: `${response.data.message} NOTA: Token di verifica per test: ${response.data.verificationInfo.token}`
        });
      }
    } catch (err: any) {
      console.error("Errore di registrazione completo:", err.response?.data);
      
      setError(err.response?.data?.message || 'Errore durante la registrazione');
      
      if (err.response?.data?.details) {
        setErrorDetails(err.response.data.details);
      } else if (err.response?.data?.error) {
        setErrorDetails(`Codice errore: ${err.response.data.error}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Gestisce l'invio del form di login
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setErrorDetails(null);
    
    try {
      console.log("Dati login inviati:", loginData);
      const response = await authServices.login(loginData);
      setResult(response.data);
      
      if (response.data.token) {
        setToken(response.data.token);
        setIsLoggedIn(true);
      }
      
      setLoginData({ username: '', password: '' });
    } catch (err: any) {
      console.error("Errore di login completo:", err.response?.data);
      
      setError(err.response?.data?.message || 'Errore durante il login');
      
      if (err.response?.data?.details) {
        setErrorDetails(err.response.data.details);
      } else if (err.response?.data?.error) {
        setErrorDetails(`Codice errore: ${err.response.data.error}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Gestisce il logout
  const handleLogout = async () => {
    setIsLoading(true);
    setError(null);
    setErrorDetails(null);
    
    try {
      await authServices.logout();
      setResult({ message: 'Logout effettuato con successo' });
      setIsLoggedIn(false);
    } catch (err: any) {
      setError('Errore durante il logout');
    } finally {
      setIsLoading(false);
    }
  };

  // Gestisce la modifica dei campi nel form di verifica
  const handleVerifyTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVerifyToken(e.target.value);
  };

  // Gestisce l'invio del form di verifica
  const handleVerifyAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!verifyToken) return;
    
    setIsLoading(true);
    setError(null);
    setErrorDetails(null);
    
    try {
      const response = await authServices.verifyAccount(verifyToken);
      setResult(response.data);
      setVerifyToken('');
    } catch (err: any) {
      console.error("Errore di verifica account:", err.response?.data);
      setError(err.response?.data?.message || 'Errore durante la verifica dell\'account');
      
      if (err.response?.data?.details) {
        setErrorDetails(err.response.data.details);
      } else if (err.response?.data?.error) {
        setErrorDetails(`Codice errore: ${err.response.data.error}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="row">
      <div className="col-12">
        <div className="card">
          <div className="card-header bg-primary text-white">
            <h2>Autenticazione</h2>
          </div>
          <div className="card-body">
            {isLoggedIn ? (
              <div>
                <div className="alert alert-success">
                  Sei attualmente autenticato con un token valido.
                </div>
                <button 
                  className="btn btn-danger" 
                  onClick={handleLogout}
                  disabled={isLoading}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="row">
                <div className="col-md-6">
                  <h3>Registrazione</h3>
                  <form onSubmit={handleRegister}>
                    <div className="mb-3">
                      <label htmlFor="registerUsername" className="form-label">Username</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="registerUsername" 
                        name="username" 
                        value={registerData.username}
                        onChange={handleRegisterChange}
                        required
                      />
                      <div className="form-text">Minimo 3 caratteri.</div>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="registerEmail" className="form-label">Email</label>
                      <input 
                        type="email" 
                        className="form-control" 
                        id="registerEmail"
                        name="email" 
                        value={registerData.email}
                        onChange={handleRegisterChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="registerPassword" className="form-label">Password</label>
                      <input 
                        type="password" 
                        className="form-control" 
                        id="registerPassword"
                        name="password"
                        value={registerData.password}
                        onChange={handleRegisterChange} 
                        required
                      />
                      <div className="form-text">Minimo 6 caratteri, almeno una lettera maiuscola, una minuscola e un numero.</div>
                    </div>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={isLoading}
                    >
                      Registrati
                    </button>
                  </form>
                </div>
                
                <div className="col-md-6">
                  <h3>Login</h3>
                  <form onSubmit={handleLogin}>
                    <div className="mb-3">
                      <label htmlFor="loginUsername" className="form-label">Username</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="loginUsername"
                        name="username"
                        value={loginData.username}
                        onChange={handleLoginChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="loginPassword" className="form-label">Password</label>
                      <input 
                        type="password" 
                        className="form-control" 
                        id="loginPassword"
                        name="password"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        required
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={isLoading}
                    >
                      Accedi
                    </button>
                  </form>
                </div>
              </div>
            )}
            
            <div className="mt-4">
              {error && (
                <div className="api-result text-danger">
                  <h5>Errore</h5>
                  <p>{error}</p>
                  {errorDetails && (
                    <div className="alert alert-warning mt-2">
                      <strong>Dettagli:</strong> {errorDetails}
                    </div>
                  )}
                </div>
              )}
              {result && !error && (
                <div className="api-result">
                  <h5>Risposta API</h5>
                  <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
              )}
              {isLoading && (
                <div className="api-result">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Caricamento...</span>
                  </div>
                  <p className="mt-2">Caricamento in corso...</p>
                </div>
              )}
            </div>

            {!isLoggedIn && (
              <div className="mt-4">
                <div className="card">
                  <div className="card-header bg-info text-white">
                    <h5>Verifica Account (Solo per Test)</h5>
                  </div>
                  <div className="card-body">
                    <p>Se la registrazione è avvenuta con successo ma l'email non è stata inviata, puoi verificare manualmente l'account inserendo il token di verifica mostrato nella risposta API.</p>
                    <form onSubmit={handleVerifyAccount} className="d-flex gap-2">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Token di verifica"
                        value={verifyToken}
                        onChange={handleVerifyTokenChange}
                        required
                      />
                      <button
                        type="submit"
                        className="btn btn-info"
                        disabled={isLoading}
                      >
                        Verifica
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth; 