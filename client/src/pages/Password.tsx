import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiResponse from '../components/ApiResponse';
import { passwordServices, getToken } from '../services/api';

const Password: React.FC = () => {
  // Ottieni il token dall'URL, se presente
  const { token } = useParams<{ token?: string }>();
  const navigate = useNavigate();
  
  // Stati per il reset della password
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // Stati per il cambio password
  const [passwordChangeData, setPasswordChangeData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Stati per la risposta dell'API
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Stato per verificare se l'utente è autenticato
  const [isLoggedIn, setIsLoggedIn] = useState(!!getToken());
  
  // Stato per indicare se siamo in modalità reset diretto tramite URL
  const [isDirectResetMode, setIsDirectResetMode] = useState(false);

  // Effetto per impostare il token quando viene passato tramite URL
  useEffect(() => {
    if (token) {
      // Impostiamo il token ricevuto dall'URL
      setResetToken(token);
      
      // Impostiamo la modalità di reset diretto
      setIsDirectResetMode(true);
      
      // Mostra un messaggio all'utente
      setResult({
        message: 'Inserisci la tua nuova password per completare il reset.'
      });
    }
  }, [token]);
  
  // Gestisce la modifica del campo email per il reset
  const handleResetEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResetEmail(e.target.value);
  };
  
  // Gestisce la modifica del campo token per il reset
  const handleResetTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResetToken(e.target.value);
  };
  
  // Gestisce la modifica del campo nuova password per il reset
  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
  };
  
  // Gestisce la modifica dei campi nel form di cambio password
  const handlePasswordChangeDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordChangeData({
      ...passwordChangeData,
      [e.target.name]: e.target.value
    });
  };
  
  // Gestisce l'invio della richiesta di reset password
  const handleRequestReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Richiesta reset password per email:', resetEmail);
      const response = await passwordServices.requestReset(resetEmail);
      console.log('Risposta richiesta reset:', response.data);
      setResult(response.data);
      setResetEmail('');
    } catch (err: any) {
      console.error('Errore richiesta reset:', err);
      const errorMessage = err.response?.data?.details || 
                          err.response?.data?.message || 
                          'Errore durante la richiesta di reset password';
      setError(errorMessage);
      setResult(err.response?.data || null);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Gestisce l'invio del form per il reset della password
  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Tentativo di reset password con token:', resetToken);
      console.log('URL della richiesta:', `/password/reset/${resetToken}`);
      console.log('Dati inviati:', { password: newPassword, confirmPassword: newPassword });
      
      const response = await passwordServices.resetPassword(resetToken, newPassword);
      console.log('Risposta reset password:', response.data);
      setResult(response.data);
      
      // Se era in modalità reset diretto, reindirizza alla pagina di login dopo il successo
      if (isDirectResetMode) {
        setTimeout(() => {
          navigate('/auth', { replace: true });
        }, 3000); // Reindirizza dopo 3 secondi
      } else {
        // Altrimenti pulisci solo i campi
        setResetToken('');
        setNewPassword('');
      }
    } catch (err: any) {
      console.error('Errore reset password:', err);
      console.error('Dettagli richiesta fallita:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: err.config?.url,
        method: err.config?.method,
        headers: err.config?.headers
      });
      
      const errorMessage = err.response?.data?.details || 
                          err.response?.data?.message || 
                          'Errore durante il reset della password';
      setError(errorMessage);
      setResult(err.response?.data || null);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Gestisce l'invio del form per il cambio password
  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    // Verifica che le password coincidano
    if (passwordChangeData.newPassword !== passwordChangeData.confirmPassword) {
      setError('Le nuove password non coincidono');
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await passwordServices.changePassword({
        currentPassword: passwordChangeData.currentPassword,
        newPassword: passwordChangeData.newPassword
      });
      setResult(response.data);
      setPasswordChangeData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Errore durante il cambio password');
    } finally {
      setIsLoading(false);
    }
  };

  // Renderizza solo il form di reset password se siamo in modalità reset diretto
  if (isDirectResetMode) {
    return (
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h2>Reset Password</h2>
            </div>
            <div className="card-body">
              <div className="alert alert-info">
                <strong>Inserisci la tua nuova password</strong>
                <p>Si prega di creare una nuova password sicura per completare il processo di reset.</p>
              </div>
              
              <form onSubmit={handleResetPassword}>
                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label">Nuova Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    id="newPassword"
                    value={newPassword}
                    onChange={handleNewPasswordChange}
                    required
                    autoFocus
                  />
                  <small className="form-text text-muted">
                    La password deve avere almeno 6 caratteri, contenere una lettera maiuscola, 
                    una minuscola e un numero.
                  </small>
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Elaborazione...' : 'Conferma Nuova Password'}
                </button>
              </form>
              
              <div className="mt-4">
                <ApiResponse result={result} error={error} isLoading={isLoading} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Renderizzazione normale della pagina per gli altri casi
  return (
    <div className="row">
      <div className="col-12">
        <div className="card">
          <div className="card-header bg-primary text-white">
            <h2>Gestione Password</h2>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <h3>Reset Password</h3>
                
                <h4 className="mt-4">Passo 1: Richiedi Reset</h4>
                <form onSubmit={handleRequestReset}>
                  <div className="mb-3">
                    <label htmlFor="resetEmail" className="form-label">Email</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      id="resetEmail"
                      value={resetEmail}
                      onChange={handleResetEmailChange}
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    Richiedi Reset Password
                  </button>
                </form>
                
                <h4 className="mt-4">Passo 2: Conferma Reset</h4>
                <form onSubmit={handleResetPassword}>
                  <div className="mb-3">
                    <label htmlFor="resetToken" className="form-label">Token di Reset</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="resetToken"
                      value={resetToken}
                      onChange={handleResetTokenChange}
                      required
                    />
                    <div className="form-text">Inserisci il token ricevuto via email.</div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label">Nuova Password</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      id="newPassword"
                      value={newPassword}
                      onChange={handleNewPasswordChange}
                      required
                    />
                    <small className="form-text text-muted">
                      La password deve avere almeno 6 caratteri, contenere una lettera maiuscola, 
                      una minuscola e un numero.
                    </small>
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    Conferma Reset Password
                  </button>
                </form>
              </div>
              
              <div className="col-md-6">
                <h3>Cambio Password</h3>
                {!isLoggedIn ? (
                  <div className="alert alert-warning">
                    Devi effettuare il login per cambiare la password.
                  </div>
                ) : (
                  <form onSubmit={handleChangePassword}>
                    <div className="mb-3">
                      <label htmlFor="currentPassword" className="form-label">Password Attuale</label>
                      <input 
                        type="password" 
                        className="form-control" 
                        id="currentPassword"
                        name="currentPassword"
                        value={passwordChangeData.currentPassword}
                        onChange={handlePasswordChangeDataChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="newPasswordChange" className="form-label">Nuova Password</label>
                      <input 
                        type="password" 
                        className="form-control" 
                        id="newPasswordChange"
                        name="newPassword"
                        value={passwordChangeData.newPassword}
                        onChange={handlePasswordChangeDataChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="confirmPassword" className="form-label">Conferma Nuova Password</label>
                      <input 
                        type="password" 
                        className="form-control" 
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordChangeData.confirmPassword}
                        onChange={handlePasswordChangeDataChange}
                        required
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={isLoading}
                    >
                      Cambia Password
                    </button>
                  </form>
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

export default Password; 