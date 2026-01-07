🚀 AutoML-Driven Web Platform for End-to-End Data Analysis and Decision Support
📌 Overview

This project presents a full-stack AutoML web platform designed to automate the complete machine learning lifecycle — from dataset ingestion to model evaluation — enabling efficient data-driven decision support with minimal manual intervention.

The system integrates multiple state-of-the-art open-source AutoML frameworks and provides a web-based interface to simplify machine learning workflows for both technical and non-technical users.

🎯 Objectives

Automate model selection and training

Eliminate manual hyperparameter tuning

Provide transparent and comparable evaluation metrics

Support informed decision-making through model insights

🧠 AutoML Frameworks Integrated

H2O AutoML

AutoGluon

TPOT

FLAML

Each framework is evaluated using standardized metrics to ensure fair comparison and reliability.

🏗️ System Architecture
User Interface (React)
        ↓
Backend API (Python)
        ↓
AutoML Engines
        ↓
Evaluation & Decision Support

🖥️ Technology Stack
Frontend

React.js

Tailwind CSS

Backend

Python

Flask / FastAPI

Pandas, NumPy, Scikit-learn

AutoML

H2O

AutoGluon

TPOT

FLAML

⚙️ Core Features

Dataset upload (CSV format)

Automated model training and evaluation

Multi-model performance comparison

Visualization of key metrics

End-to-end reproducible ML workflow

📁 Project Structure
.
├── backend/        # AutoML pipelines and APIs
├── frontend/       # Web-based user interface
├── requirements.txt
├── .gitignore

🚀 Getting Started
Clone the repository
git clone https://github.com/YUK3SH/AutoML-driven-web-platform-for-end-to-end-data-analysis-and-decision-support.git
cd AutoML-driven-web-platform-for-end-to-end-data-analysis-and-decision-support

Backend setup
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python backend/app.py

Frontend setup
cd frontend
npm install
npm start

📊 Use Cases

Automated data analysis

Machine learning benchmarking

Decision-support systems

Academic and research applications

🚧 Project Status

✔ Core AutoML pipelines implemented

✔ Frontend–backend integration completed

🔄 Deployment and monitoring under development

🔮 Future Scope

Model explainability (SHAP / LIME)

Advanced feature engineering

User authentication

Cloud deployment and scalability

👤 Author

Yukeshwar R
GitHub: YUK3SH

📜 License

This project is intended for academic and research purposes.
License details will be added in future updates.
