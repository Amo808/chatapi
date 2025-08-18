#!/usr/bin/env python3
"""
Debug script to check installed versions
"""
import sys
import os

print("🔍 Python Version Check")
print(f"Python version: {sys.version}")
print(f"Python executable: {sys.executable}")
print("-" * 50)

print("📦 Requirements Check")
if os.path.exists("requirements.txt"):
    with open("requirements.txt", "r") as f:
        print("requirements.txt contents:")
        print(f.read())
else:
    print("❌ requirements.txt not found!")

print("-" * 50)

print("🔧 Installed Package Versions")
try:
    import fastapi
    print(f"✅ FastAPI version: {fastapi.__version__}")
except ImportError:
    print("❌ FastAPI not installed")

try:
    import pydantic
    print(f"✅ Pydantic version: {pydantic.VERSION}")
except ImportError:
    print("❌ Pydantic not installed")

try:
    import uvicorn
    print(f"✅ Uvicorn version: {uvicorn.__version__}")
except ImportError:
    print("❌ Uvicorn not installed")

print("-" * 50)

print("🧪 Compatibility Test")
try:
    from fastapi import FastAPI
    app = FastAPI(title="Test App")
    print("✅ FastAPI imports successfully")
    
    from pydantic import BaseModel
    class TestModel(BaseModel):
        test: str = "hello"
    print("✅ Pydantic models work")
    
    print("🎉 All compatibility checks passed!")
    
except Exception as e:
    print(f"❌ Compatibility error: {e}")
    import traceback
    traceback.print_exc()
