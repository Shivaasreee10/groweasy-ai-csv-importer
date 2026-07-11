# GrowEasy AI CSV Importer

An AI-powered CSV Importer built for the GrowEasy Software Developer Assessment.

The application allows users to upload CSV files with different column names and layouts. Using Gemini AI, it intelligently maps the uploaded data into the GrowEasy CRM format.

## Live Demo

**Frontend:**  
https://groweasy-ai-csv-importer-pi.vercel.app

**Backend API:**  
https://groweasy-ai-csv-importer-60og.onrender.com

---

## Features

- CSV Upload
- Drag & Drop Upload
- CSV Preview
- AI-powered CRM Field Mapping
- Intelligent Column Mapping
- Skip Invalid Records
- Search Records
- Download CRM CSV
- Progress Indicator
- Responsive UI

---

## Tech Stack

### Frontend
- Next.js
- React
- Tailwind CSS

### Backend
- FastAPI
- Gemini AI
- Python

---

## Project Structure

```
backend/
frontend/
sample-data/
README.md
```

---

## Run Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Sample Test Files

The `sample-data` folder contains sample CSV files to test different scenarios:

- sample.csv
- test.csv
- test2.csv
- invalid.csv

---

## AI Capabilities

- Maps different column names intelligently
- Extracts CRM fields using Gemini AI
- Handles multiple CSV formats
- Skips invalid records without email or phone
- Returns structured CRM JSON output
