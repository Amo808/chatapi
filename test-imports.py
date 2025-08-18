#!/usr/bin/env python3
"""
Test script to verify all required imports work correctly
This simulates what would happen on Render during deployment
"""
import sys
print(f"Python version: {sys.version}")

try:
    import fastapi
    print(f"✅ FastAPI {fastapi.__version__} imported successfully")
except Exception as e:
    print(f"❌ FastAPI import failed: {e}")

try:
    import uvicorn
    print(f"✅ Uvicorn {uvicorn.__version__} imported successfully")
except Exception as e:
    print(f"❌ Uvicorn import failed: {e}")

try:
    import pydantic
    print(f"✅ Pydantic {pydantic.VERSION} imported successfully")
except Exception as e:
    print(f"❌ Pydantic import failed: {e}")

try:
    import httpx
    print(f"✅ HTTPX {httpx.__version__} imported successfully")
except Exception as e:
    print(f"❌ HTTPX import failed: {e}")

try:
    import aiofiles
    print(f"✅ aiofiles imported successfully")
except Exception as e:
    print(f"❌ aiofiles import failed: {e}")

try:
    import websockets
    print(f"✅ websockets {websockets.__version__} imported successfully")
except Exception as e:
    print(f"❌ websockets import failed: {e}")

try:
    import yaml
    print(f"✅ PyYAML imported successfully")
except Exception as e:
    print(f"❌ PyYAML import failed: {e}")

# Test FastAPI app creation
try:
    app = fastapi.FastAPI()
    print("✅ FastAPI app creation works")
except Exception as e:
    print(f"❌ FastAPI app creation failed: {e}")

# Test that we don't accidentally import httptools
try:
    import httptools
    print("⚠️  WARNING: httptools was imported (this might cause issues on Render)")
except ImportError:
    print("✅ httptools not present (good - avoids C extension build issues)")

print("\n🎯 Import test completed!")
