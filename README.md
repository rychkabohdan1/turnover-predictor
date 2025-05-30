# Staff Turnover Prediction System

A full-stack application for predicting staff turnover using machine learning. Built with Python (FastAPI) and React.

## Features

- Employee data input form
- Real-time turnover prediction
- Risk level assessment
- Modern UI with Material-UI components

## Prerequisites

- Python 3.8+
- Node.js 14+
- npm or yarn

## Setup

### Backend Setup

1. Create a virtual environment (optional but recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Start the backend server:
```bash
cd backend
uvicorn main:app --reload
```

The backend will be available at http://localhost:8000

### Frontend Setup

1. Install frontend dependencies:
```bash
cd frontend
npm install
```

2. Start the frontend development server:
```bash
npm start
```

The frontend will be available at http://localhost:3000

## Usage

1. Open your browser and navigate to http://localhost:3000
2. Fill in the employee information form
3. Click "Predict Turnover" to get the prediction results
4. View the turnover probability and risk level

## API Endpoints

- POST /predict - Get turnover prediction
- GET /health - Health check endpoint

## Technologies Used

- Backend:
  - FastAPI
  - scikit-learn
  - pandas
  - numpy

- Frontend:
  - React
  - TypeScript
  - Material-UI
  - Axios #   t u r n o v e r p r e d i c t i o n  
 #   t u r n o v e r p r e d i c t i o n  
 #   t u r n o v e r - p r e d i c t o r  
 