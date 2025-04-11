import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { passwordServices } from '../services/api';

const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Inizia caricando per verificare il token
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('Token di reset non trovato nell\'URL.');
        setIsValidToken(false);
        setIsLoading(false);
        return;
      }

      try {
        await passwordServices.verifyResetToken(token);
        setIsValidToken(true);
      } catch (err: any) {
        setError(err.response?.data?.details || 'Token di reset non valido o scaduto.');
        setIsValidToken(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (newPassword !== confirmPassword) {
      setError('Le password non coincidono.');
      return;
    }

    if (!token) {
      setError('Token non disponibile.'); // Sicurezza aggiuntiva
      return;
    }

    setIsLoading(true);
    try {
      const response = await passwordServices.resetPassword(token, { 
        password: newPassword, 
        confirmPassword: confirmPassword 
      });
      setSuccessMessage(response.data.message || 'Password reimpostata con successo!');
      // Opzionale: reindirizza al login dopo un breve ritardo
      setTimeout(() => {
        navigate('/login'); 
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.details || 'Errore durante il reset della password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h2>Reimposta Password</h2>
            </div>
            <div className="card-body">
              {isLoading && <p>Verifica del token in corso...</p>}

              {!isLoading && isValidToken === false && (
                <div className="alert alert-danger">
                  {error || 'Impossibile reimpostare la password. Il link potrebbe essere scaduto o non valido.'}
                </div>
              )}

              {!isLoading && isValidToken === true && (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label">Nuova Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="newPassword"
                      value={newPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength={6} // Aggiungi validazioni base HTML
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">Conferma Nuova Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      required
                      minLength={6}
                    />
                  </div>
                  
                  {error && (
                    <div className="alert alert-danger">{error}</div>
                  )}
                  {successMessage && (
                    <div className="alert alert-success">{successMessage}</div>
                  )}
                  
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isLoading || !newPassword || !confirmPassword}
                  >
                    {isLoading ? 'Reimpostazione...' : 'Reimposta Password'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage; 