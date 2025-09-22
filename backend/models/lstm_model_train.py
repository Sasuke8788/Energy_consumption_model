import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from sklearn.preprocessing import MinMaxScaler
import joblib
num_hours = 720
timestamps = [datetime.now() - timedelta(hours=i) for i in range(num_hours)][::-1]

data = pd.DataFrame({
    "timestamp": timestamps,
    "temperature": np.random.uniform(15, 35, size=num_hours),
    "humidity": np.random.uniform(30, 90, size=num_hours),
    "tariff": np.random.uniform(0.1, 0.3, size=num_hours)
})

data["energy"] = (
    5 +
    0.2 * data["temperature"] +
    0.1 * data["humidity"] +
    20 * data["tariff"] +
    np.random.normal(0, 0.5, size=num_hours)
)
features = ["energy", "temperature", "humidity", "tariff"]
scaler = MinMaxScaler()
scaled_data = scaler.fit_transform(data[features])
X, y = [], []
seq_length = 24
for i in range(len(scaled_data) - seq_length):
    X.append(scaled_data[i:i + seq_length])
    y.append(scaled_data[i + seq_length][0])

X = np.array(X)
y = np.array(y)
model = Sequential()
model.add(LSTM(64, input_shape=(X.shape[1], X.shape[2])))
model.add(Dense(1))
model.compile(loss='mse', optimizer='adam')
model.fit(X, y, epochs=10, batch_size=32, verbose=1)
model.save("lstm_energy_model.h5")
joblib.dump(scaler, "lstm_scaler.pkl")
