import React, { useState } from 'react';
import ResultChart from './ResultChart';

function PredictionForm() {
  const [input, setInput] = useState({
    energy_usage_kWh: '',
    temperature: '',
    humidity: '',
    tariff: ''
  });
  const [result, setResult] = useState(null);
  const [chartData, setChartData] = useState([]);

  const handleChange = (e) => {
    setInput({ ...input, [e.target.name]: parseFloat(e.target.value) });
  };

  const validateInput = () => {
    return Object.values(input).every(val => typeof val === 'number' && !isNaN(val));
  };

  const handleSubmit = async () => {
    if (!validateInput()) {
      alert("Please fill in all fields with valid numbers.");
      return;
    }
    const token = localStorage.getItem("token");
    try {
      const res = await fetch('http://127.0.0.1:5000/predict-xgb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(input)
      });
      const data = await res.json();
      if (data.predicted_energy) {
        setResult(data.predicted_energy);
        setChartData([
          { name: 'Input', Energy: input.energy_usage_kWh },
          { name: 'Prediction', Energy: data.predicted_energy }
        ]);
      } else {
        alert('Error: ' + JSON.stringify(data));
      }
    } catch (error) {
      alert('Request failed: ' + error);
    }
  };
  

  const avgEstimate = input.energy_usage_kWh;
  const highUsage = result !== null && result > avgEstimate * 1.2;
  const co2Saved = 2 * 0.92;

  return (
    <div className="max-w-md w-full bg-white p-6 rounded-2xl shadow-md">
      <h1 className="text-xl font-bold mb-4 text-center">XGBoost Energy Prediction</h1>
      <div className="space-y-3">
        {['energy_usage_kWh', 'temperature', 'humidity', 'tariff'].map(field => (
          <div key={field}>
            <label className="block mb-1 capitalize">{field.replace(/_/g, ' ')}:</label>
            <input
              type="number"
              name={field}
              step="any"
              value={input[field] || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        ))}
        <button
          onClick={handleSubmit}
          className="w-full py-2 mt-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded"
        >
          Predict
        </button>
      </div>

      {result !== null && (
        <div className="mt-6 text-center space-y-2">
          <p className="text-lg font-semibold text-green-700">
            Predicted Energy Usage: {result} kWh
          </p>
          {highUsage && (
            <p className="text-red-600 font-medium">
              ⚠️ Your predicted energy usage is {Math.round(((result - avgEstimate) / avgEstimate) * 100)}% higher than the input value.
            </p>
          )}
          <p className="text-green-700">
            🌱 Saving 2 kWh this week reduces about {co2Saved.toFixed(2)} kg of CO₂ emissions.
          </p>
          <ResultChart sequence={[{ energy: input.energy_usage_kWh }]} prediction={result} />
        </div>
      )}
    </div>
  );
}

export default PredictionForm;