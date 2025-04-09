import React from 'react';

interface ApiResponseProps {
  result: any;
  error: string | null;
  isLoading: boolean;
}

const ApiResponse: React.FC<ApiResponseProps> = ({ result, error, isLoading }) => {
  if (isLoading) {
    return (
      <div className="api-result">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Caricamento...</span>
        </div>
        <p className="mt-2">Caricamento in corso...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="api-result text-danger">
        <h5>Errore</h5>
        <p>{error}</p>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <div className="api-result">
      <h5>Risposta API</h5>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  );
};

export default ApiResponse; 