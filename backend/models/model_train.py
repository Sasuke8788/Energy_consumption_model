import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
import joblib

data = {
    "energy_usage_kWh": np.random.rand(1000) * 10,
    "temperature": np.random.rand(1000) * 40,
    "humidity": np.random.rand(1000) * 100,
    "tariff": np.random.rand(1000) * 0.5
}
df = pd.DataFrame(data)
df['target'] = df['energy_usage_kWh'] * 0.8 + df['temperature'] * 0.1 + df['humidity'] * 0.05 + df['tariff'] * 0.3

X = df.drop(columns=['target'])
y = df['target']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = xgb.XGBRegressor()
model.fit(X_train, y_train)
joblib.dump(model, 'xgb_energy_model.pkl')
