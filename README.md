# Energy Consumption Model 

This repository contains a full-stack application designed to predict energy consumption using machine learning models. The project is split into a backend API built with Flask and a frontend for user interaction.

## Features

* **User Authentication**: Secure user registration and login endpoints.
* **Predictive Models**: Includes two pre-trained models for energy prediction: a time-series model (LSTM) and a regression model (XGBoost).
* **Prediction History**: Stores and retrieves past prediction requests for logged-in users.
* **Database**: Uses SQLite to manage user and prediction data.
* **API Endpoints**: A set of well-defined endpoints for seamless communication between the frontend and backend.
* **Scalable Structure**: The project is organized with separate directories for the backend and frontend, making it easy to develop and maintain.

## Technologies

* **Backend**: Python, Flask, SQLAlchemy, TensorFlow, XGBoost, and other libraries listed in `requirements.txt`.
* **Frontend**: Built with JavaScript and its ecosystem (e.g., React, Node.js).
* **Database**: SQLite.
