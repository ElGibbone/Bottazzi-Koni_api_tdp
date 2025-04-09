import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ApiResponse from '../components/ApiResponse';
import { emailServices, getToken } from '../services/api';

const Email: React.FC = () => {
  // Stati per la verifica dell'email
  const [verificationToken, setVerificationToken] = useState('');
  
  // Stati per la risposta dell'API
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Stato per verificare se l'utente è autenticato
  const [isLoggedIn, setIsLoggedIn] = useState(!!getToken());
  
  // Ottieni i parametri dall'URL
  const location = useLocation();
  
  useEffect(() => {
    // Controlla se c'è un token di verifica nell'URL
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    
    if (token) {
      setVerificationToken(token);
      // Verifica automaticamente l'email se viene fornito un token nell'URL
      handleVerifyEmail(token);
    }
  }, [location]);
  
  // Gestisce la modifica del campo token di verifica
  const handleVerificationTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVerificationToken(e.target.value);
  };
  
  // Gestisce la verifica dell'email con un token
  const handleVerifyEmail = async (token?: string) => {
    setIsLoading(true);
    setError(null);
    
    const tokenToUse = token || verificationToken;
    
    if (!tokenToUse) {
      setError('Token di verifica non valido');
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await emailServices.verifyEmail(tokenToUse);
      setResult(response.data);
      if (!token) {
        setVerificationToken('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Errore durante la verifica dell\'email');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Gestisce l'invio del form di verifica
  const handleVerifySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleVerifyEmail();
  };
  
  // Gestisce la richiesta di invio di una nuova email di verifica
  const handleResendVerification = async () => {
    if (!isLoggedIn) {
      setError('Devi effettuare il login per richiedere una nuova email di verifica');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await emailServices.resendVerification();
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Errore durante l\'invio dell\'email di verifica');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="row">
      <div className="col-12">
        <div className="card">
          <div className="card-header bg-primary text-white">
            <h2>Verifica Email</h2>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <h3>Verifica con Token</h3>
                <p>Inserisci il token di verifica ricevuto via email.</p>
                
                <form onSubmit={handleVerifySubmit}>
                  <div className="mb-3">
                    <label htmlFor="verificationToken" className="form-label">Token di Verifica</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="verificationToken"
                      value={verificationToken}
                      onChange={handleVerificationTokenChange}
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isLoading || !verificationToken}
                  >
                    Verifica Email
                  </button>
                </form>
              </div>
              
              <div className="col-md-6">
                <h3>Richiedi Nuova Email di Verifica</h3>
                {!isLoggedIn ? (
                  <div className="alert alert-warning">
                    Devi effettuare il login per richiedere una nuova email di verifica.
                  </div>
                ) : (
                  <div>
                    <p>Se non hai ricevuto l'email di verifica o è scaduta, puoi richiederne una nuova.</p>
                    <button 
                      className="btn btn-secondary" 
                      onClick={handleResendVerification}
                      disabled={isLoading}
                    >
                      Richiedi Nuova Email di Verifica
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-4">
              <ApiResponse result={result} error={error} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Email; 