import React, { useState, useEffect } from 'react';
import PredictionForm from './components/PredictionForm';
import LSTMForm from './components/LSTMForm';
import LoginForm from './components/LoginForm.js';
import History from './components/History';

function App() {
  const [mode, setMode] = useState('xgb');
  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setToken(token);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {!token ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        <>
          <div className="max-w-3xl mx-auto mb-6 text-center">
            <h1 className="text-3xl font-bold mb-2">Energy Prediction App</h1>
            <div className="space-x-4 mb-4">
              <button
                onClick={() => setMode('xgb')}
                className={`px-4 py-2 rounded ${mode === 'xgb' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
              >
                XGBoost
              </button>
              <button
                onClick={() => setMode('lstm')}
                className={`px-4 py-2 rounded ${mode === 'lstm' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
              >
                LSTM
              </button>
              <button
                onClick={() => setMode('history')}
                className={`px-4 py-2 rounded ${mode === 'history' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
              >
                History
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded bg-red-500 text-white"
              >
                Logout
              </button>
            </div>
          </div>
          <div className="flex justify-center">
            {mode === 'xgb' ? <PredictionForm /> :
             mode === 'lstm' ? <LSTMForm /> :
             <History />}
          </div>
        </>
      )}
    </div>
  );
}

export default App;