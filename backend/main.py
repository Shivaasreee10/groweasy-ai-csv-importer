from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from ai import extract_crm_records
from pydantic import BaseModel
from typing import List, Dict, Any
from parser import parse_csv

app = FastAPI(
    title="GrowEasy AI CSV Importer",
    version="1.0.0"

)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class ProcessRequest(BaseModel):
    records: List[Dict[str, Any]]


@app.get("/")
def home():
    return {
        "message": "Welcome to GrowEasy AI CSV Importer API",
        "status": "Running Successfully"
    }
@app.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        return {"error": "Please upload a valid CSV file"}

    result = parse_csv(file.file)
    return result
@app.post("/process")
async def process_csv(data: ProcessRequest):
    try:
        result = extract_crm_records(data.records)
        return result

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
