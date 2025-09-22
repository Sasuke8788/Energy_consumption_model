import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

function History() {
  const [history, setHistory] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('http://127.0.0.1:5000/history', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setHistory(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching history:', err);
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    if (filter === 'all') {
      setFiltered(history);
    } else {
      setFiltered(history.filter((item) => item.model === filter));
    }
  }, [filter, history]);

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-2xl shadow-md mt-6">
      <h2 className="text-2xl font-bold text-center mb-4">Prediction History</h2>

      <div className="mb-4 text-center">
        <label className="mr-2 font-medium">Filter by model:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border px-3 py-1 rounded"
        >
          <option value="all">All</option>
          <option value="xgb">XGBoost</option>
          <option value="lstm">LSTM</option>
        </select>
      </div>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center">No predictions found.</p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filtered.slice().reverse()} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" fontSize={10} />
              <YAxis domain={['auto', 'auto']} label={{ value: 'kWh', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="prediction" stroke="#8884d8" name="Predicted kWh" />
            </LineChart>
          </ResponsiveContainer>

          <table className="w-full text-sm text-left border mt-6">
            <thead>
              <tr>
                <th className="p-2 border">Model</th>
                <th className="p-2 border">Prediction (kWh)</th>
                <th className="p-2 border">Time</th>
                <th className="p-2 border">Inputs</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => (
                <tr key={i}>
                  <td className="p-2 border">{item.model.toUpperCase()}</td>
                  <td className="p-2 border">{item.prediction.toFixed(2)}</td>
                  <td className="p-2 border">{item.timestamp}</td>
                  <td className="p-2 border">
                    <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(item.input, null, 2)}</pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default History;
