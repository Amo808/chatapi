#!/bin/bash
cd "/c/gpt-pilot-main/gpt-pilot/workspace/api chat"
source venv/Scripts/activate
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
