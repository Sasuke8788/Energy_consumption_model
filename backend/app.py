from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
import joblib
import numpy as np
import pandas as pd
from tensorflow.keras.models import load_model #type:ignore
from datetime import datetime
from sqlalchemy.dialects.sqlite import JSON
import os

app = Flask(__name__)
CORS(app)
app.config['JWT_SECRET_KEY'] = 'your_secret_key_here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
jwt = JWTManager(app)
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

class Prediction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    model = db.Column(db.String(10))
    input_data = db.Column(JSON)
    prediction = db.Column(db.Float)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

with app.app_context():
    db.create_all()

xgb_model = joblib.load("backend/saved_model_files/xgb_energy_model.pkl")
lstm_model = load_model("backend/saved_model_files/lstm_energy_model.h5", compile=False)
lstm_scaler = joblib.load("backend/saved_model_files/lstm_scaler.pkl")

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'msg': 'Username already exists'}), 409
    hashed_pw = generate_password_hash(data['password'])
    new_user = User(username=data['username'], password=hashed_pw)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'msg': 'User registered successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({'msg': 'Invalid credentials'}), 401
    token = create_access_token(identity=user.username)
    return jsonify(access_token=token)

@app.route('/predict-xgb', methods=['POST'])
@jwt_required()
def predict_xgb():
    data = request.json
    features = np.array([[data['energy_usage_kWh'], data['temperature'], data['humidity'], data['tariff']]])
    prediction = xgb_model.predict(features)[0]

    user = User.query.filter_by(username=get_jwt_identity()).first()
    db.session.add(Prediction(
        user_id=user.id,
        model='xgb',
        input_data=data,
        prediction=float(prediction)
    ))
    db.session.commit()

    return jsonify({'predicted_energy': round(float(prediction), 2)})

@app.route('/predict-lstm', methods=['POST'])
@jwt_required()
def predict_lstm():
    data = request.json
    try:
        sequence = pd.DataFrame(data["sequence"])
        expected_columns = ["energy", "temperature", "humidity", "tariff"]
        sequence = sequence[expected_columns]
        assert sequence.shape == (24, 4)
        scaled = lstm_scaler.transform(sequence)
        lstm_input = np.expand_dims(scaled, axis=0)
        prediction = lstm_model.predict(lstm_input)[0][0]
        predicted_energy = lstm_scaler.inverse_transform([[prediction, 0, 0, 0]])[0][0]

        user = User.query.filter_by(username=get_jwt_identity()).first()
        db.session.add(Prediction(
            user_id=user.id,
            model='lstm',
            input_data=data["sequence"],
            prediction=predicted_energy
        ))
        db.session.commit()

        return jsonify({'predicted_energy': round(float(predicted_energy), 2)})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    user = User.query.filter_by(username=get_jwt_identity()).first()
    records = Prediction.query.filter_by(user_id=user.id).order_by(Prediction.timestamp.desc()).all()
    history = [{
        'model': r.model,
        'input': r.input_data,
        'prediction': r.prediction,
        'timestamp': r.timestamp.strftime('%Y-%m-%d %H:%M:%S')
    } for r in records]
    return jsonify(history)

if __name__ == '__main__':
    app.run(debug=True)