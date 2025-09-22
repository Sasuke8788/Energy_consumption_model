import React, { useState } from 'react';

function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isRegistering ? '/register' : '/login';
    try {
      const res = await fetch(`http://127.0.0.1:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok && data.access_token) {
        onLogin(data.access_token);
      } else if (res.ok && data.msg) {
        alert(data.msg);
      } else {
        alert(data.msg || 'Something went wrong');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="max-w-sm mx-auto p-6 mt-20 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold text-center mb-4">
        {isRegistering ? 'Register' : 'Login'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded"
        >
          {isRegistering ? 'Register' : 'Login'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          type="button"
          onClick={() => setIsRegistering(!isRegistering)}
          className="text-indigo-600 hover:underline"
        >
          {isRegistering ? 'Login' : 'Register'}
        </button>
      </p>
    </div>
  );
}

export default LoginForm;
