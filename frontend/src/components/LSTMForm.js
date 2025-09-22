import React, { useState } from 'react';
import ResultChart from './ResultChart';

const generateSimulatedData = () => {
  const sequence = [];
  for (let i = 0; i < 24; i++) {
    sequence.push({
      energy: +(11 + Math.random() * 3).toFixed(2),
      temperature: +(22 + Math.random() * 10).toFixed(2),
      humidity: +(40 + Math.random() * 20).toFixed(2),
      tariff: +(0.15 + Math.random() * 0.05).toFixed(2),
    });
  }
  return sequence;
};

function LSTMForm() {
  const [sequence, setSequence] = useState(generateSimulatedData());
  const [result, setResult] = useState(null);

  const handleChange = (index, field, value) => {
    const updated = [...sequence];
    updated[index][field] = parseFloat(value);
    setSequence(updated);
  };

  const validateSequence = () => {
    return sequence.every(row =>
      ['energy', 'temperature', 'humidity', 'tariff'].every(field =>
        typeof row[field] === 'number' && !isNaN(row[field])
      )
    );
  };

  const handleSimulate = () => {
    setSequence(generateSimulatedData());
    setResult(null);
  };

  const handleSubmit = async () => {
    if (!validateSequence()) {
      alert("Please fill in all fields with valid numbers for all 24 hours.");
      return;
    }
    const token = localStorage.getItem("token");
    try {
      const res = await fetch('http://127.0.0.1:5000/predict-lstm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sequence })
      });
      const data = await res.json();
      if (data.predicted_energy) {
        setResult(data.predicted_energy);
      } else {
        alert('Error: ' + JSON.stringify(data));
      }
    } catch (error) {
      alert('Request failed: ' + error);
    }
  };
  

  return (
    <div className="max-w-5xl w-full mx-auto p-6 bg-white rounded-2xl shadow-md">
      <h1 className="text-2xl font-bold text-center mb-4">LSTM Energy Prediction</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr>
              <th className="p-2 border">Hour</th>
              <th className="p-2 border">Energy</th>
              <th className="p-2 border">Temp (°C)</th>
              <th className="p-2 border">Humidity (%)</th>
              <th className="p-2 border">Tariff (₹)</th>
            </tr>
          </thead>
          <tbody>
            {sequence.map((row, i) => (
              <tr key={i}>
                <td className="p-2 border text-center">{i + 1}</td>
                {['energy', 'temperature', 'humidity', 'tariff'].map((field) => (
                  <td className="p-2 border" key={field}>
                    <input
                      type="number"
                      step="any"
                      value={row[field]}
                      onChange={(e) => handleChange(i, field, e.target.value)}
                      className="w-full px-2 py-1 border rounded"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between mt-4">
        <button
          onClick={handleSimulate}
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
        >
          Simulate Data
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded"
        >
          Predict
        </button>
      </div>
      {result !== null && (
        <div className="mt-4 text-center space-y-2">
          <p className="text-xl font-semibold text-green-700">
            Predicted Energy (Next Hour): {result} kWh
          </p>
          {(() => {
            const avgEnergy = sequence.reduce((sum, row) => sum + parseFloat(row.energy), 0) / sequence.length;
            const highUsage = result > avgEnergy * 1.2;
            return (
              <>
                {highUsage && (
                  <p className="text-red-600 font-medium">
                    ⚠️ Your current energy usage is {Math.round(((result - avgEnergy) / avgEnergy) * 100)}% higher than your 24-hour average.
                  </p>
                )}
                <p className="text-green-700">
                  🌱 Reducing your energy by 2 kWh this week can save approx. <strong>{(2 * 0.92).toFixed(2)} kg</strong> of CO₂ emissions.
                </p>
              </>
            );
          })()}
          <ResultChart sequence={sequence} prediction={result} />
        </div>
      )}
    </div>
  );
}

export default LSTMForm;