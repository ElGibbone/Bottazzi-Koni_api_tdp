import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ApiResponse from '../components/ApiResponse';

const Home: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Prima verifico l'API base senza proxy
    console.log("Tentativo di connessione all'API...");
    
    // Utilizzo direttamente l'URL dell'API senza webpack proxy
    fetch('http://localhost:3000', {
      method: 'GET',
      headers: {
        'Accept': '*/*',
      }
    })
    .then(response => {
      console.log("Risposta API ricevuta:", response);
      return response.text();
    })
    .then(data => {
      console.log("Dati ricevuti:", data);
      setApiStatus({ message: data });
      setIsLoading(false);
    })
    .catch(err => {
      console.error("Errore di connessione:", err);
      setError(`Impossibile connettersi all'API: ${err.message}. Assicurati che il server sia in esecuzione sulla porta 3000.`);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="row">
      <div className="col-12">
        <div className="card">
          <div className="card-header bg-primary text-white">
            <h2>Test API di Autenticazione</h2>
          </div>
          <div className="card-body">
            <p>Questa applicazione permette di testare tutte le funzionalità dell'API di autenticazione.</p>
            <p>Stato del server API: </p>
            <ApiResponse result={apiStatus} error={error} isLoading={isLoading} />
            
            <div className="mt-3">
              <button 
                className="btn btn-secondary" 
                onClick={() => window.location.reload()}
                disabled={isLoading}
              >
                Riprova connessione
              </button>
            </div>
            
            <h4 className="mt-4">Funzionalità disponibili:</h4>
            <div className="list-group mt-3">
              <Link to="/auth" className="list-group-item list-group-item-action">
                <div className="d-flex w-100 justify-content-between">
                  <h5 className="mb-1">Autenticazione</h5>
                </div>
                <p className="mb-1">Registrazione, login e logout degli utenti</p>
              </Link>
              <Link to="/user" className="list-group-item list-group-item-action">
                <div className="d-flex w-100 justify-content-between">
                  <h5 className="mb-1">Gestione Utenti</h5>
                </div>
                <p className="mb-1">Visualizzazione profilo, aggiornamento dati e cancellazione account</p>
              </Link>
              <Link to="/password" className="list-group-item list-group-item-action">
                <div className="d-flex w-100 justify-content-between">
                  <h5 className="mb-1">Gestione Password</h5>
                </div>
                <p className="mb-1">Reset e cambio password</p>
              </Link>
              <Link to="/email" className="list-group-item list-group-item-action">
                <div className="d-flex w-100 justify-content-between">
                  <h5 className="mb-1">Verifica Email</h5>
                </div>
                <p className="mb-1">Verifica e reinvio email di conferma</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 