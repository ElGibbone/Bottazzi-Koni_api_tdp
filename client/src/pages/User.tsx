import React, { useState, useEffect } from 'react';
import ApiResponse from '../components/ApiResponse';
import { userServices, getToken } from '../services/api';

const User: React.FC = () => {
  // Stato per i dati del profilo
  const [profileData, setProfileData] = useState<any>(null);
  const [updateData, setUpdateData] = useState({
    name: '',
    email: ''
  });
  
  // Stati per la risposta dell'API
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Stato per verificare se l'utente è autenticato
  const [isLoggedIn, setIsLoggedIn] = useState(!!getToken());
  
  // Carica il profilo dell'utente all'avvio se è autenticato
  useEffect(() => {
    if (isLoggedIn) {
      fetchProfile();
    }
  }, [isLoggedIn]);
  
  // Gestisce la modifica dei campi nel form di aggiornamento
  const handleUpdateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUpdateData({
      ...updateData,
      [e.target.name]: e.target.value
    });
  };
  
  // Carica il profilo dell'utente
  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await userServices.getProfile();
      setProfileData(response.data);
      setUpdateData({
        name: response.data.name || '',
        email: response.data.email || ''
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Errore durante il caricamento del profilo');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Aggiorna il profilo dell'utente
  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await userServices.updateProfile(updateData);
      setResult(response.data);
      setProfileData({
        ...profileData,
        ...updateData
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Errore durante l\'aggiornamento del profilo');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Elimina l'account dell'utente
  const handleDeleteAccount = async () => {
    if (!window.confirm('Sei sicuro di voler eliminare il tuo account? Questa azione non può essere annullata.')) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await userServices.deleteAccount();
      setResult(response.data);
      setProfileData(null);
      setIsLoggedIn(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Errore durante l\'eliminazione dell\'account');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Ottiene tutti gli utenti (solo per admin)
  const handleGetAllUsers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await userServices.getAllUsers();
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Errore durante il recupero degli utenti');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="row">
      <div className="col-12">
        <div className="card">
          <div className="card-header bg-primary text-white">
            <h2>Gestione Utenti</h2>
          </div>
          <div className="card-body">
            {!isLoggedIn ? (
              <div className="alert alert-warning">
                Devi effettuare il login per utilizzare queste funzionalità.
              </div>
            ) : (
              <div className="row">
                <div className="col-md-6">
                  <h3>Informazioni Profilo</h3>
                  {profileData && (
                    <div className="card mb-4">
                      <div className="card-body">
                        <h5 className="card-title">{profileData.name}</h5>
                        <p className="card-text">Email: {profileData.email}</p>
                        <p className="card-text">
                          Email verificata: {profileData.isVerified ? 
                            <span className="text-success">Sì</span> : 
                            <span className="text-danger">No</span>}
                        </p>
                        <button 
                          className="btn btn-danger" 
                          onClick={handleDeleteAccount}
                          disabled={isLoading}
                        >
                          Elimina Account
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <h3>Aggiorna Profilo</h3>
                  <form onSubmit={handleUpdateProfile}>
                    <div className="mb-3">
                      <label htmlFor="updateName" className="form-label">Nome</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="updateName"
                        name="name"
                        value={updateData.name}
                        onChange={handleUpdateChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="updateEmail" className="form-label">Email</label>
                      <input 
                        type="email" 
                        className="form-control" 
                        id="updateEmail"
                        name="email"
                        value={updateData.email}
                        onChange={handleUpdateChange}
                        required
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={isLoading}
                    >
                      Aggiorna Profilo
                    </button>
                  </form>
                </div>
                
                <div className="col-md-6">
                  <h3>Admin: Elenco Utenti</h3>
                  <p>Questa funzione è disponibile solo per gli amministratori.</p>
                  <button 
                    className="btn btn-secondary" 
                    onClick={handleGetAllUsers}
                    disabled={isLoading}
                  >
                    Ottieni Tutti gli Utenti
                  </button>
                </div>
              </div>
            )}
            
            <div className="mt-4">
              <ApiResponse result={result} error={error} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default User; 