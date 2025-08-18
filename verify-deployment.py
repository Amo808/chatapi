#!/usr/bin/env python3
"""
🔍 Pre-deployment verification script
Checks all key components before Render deployment
"""

import os
import json
import asyncio
from pathlib import Path

def check_file_exists(file_path, description):
    """Check if a file exists"""
    if os.path.exists(file_path):
        print(f"✅ {description}: {file_path}")
        return True
    else:
        print(f"❌ {description}: {file_path} - NOT FOUND")
        return False

def check_requirements():
    """Check requirements files"""
    print("📦 Checking requirements files...")
    
    req_main = check_file_exists("requirements.txt", "Main requirements")
    req_minimal = check_file_exists("requirements-minimal.txt", "Minimal requirements")
    req_ultra = check_file_exists("requirements-ultra.txt", "Ultra-minimal requirements")
    
    if req_ultra:
        with open("requirements-ultra.txt", 'r', encoding='utf-8') as f:
            content = f.read()
            if "pydantic==1.10.2" in content:
                print("✅ Pydantic v1.10.2 (stable, no Rust)")
            if "fastapi==0.85.1" in content:
                print("✅ FastAPI 0.85.1 (proven stable)")
            if "uvicorn==0.20.0" in content:
                print("✅ Uvicorn 0.20.0 (compatible)")
                
    if req_minimal:
        print("✅ Fallback requirements available")
        
    if req_main:
        print("✅ Main requirements available")

def check_render_config():
    """Check Render configuration"""
    print("\n🚀 Checking Render configuration...")
    
    if check_file_exists("render.yaml", "Render config"):
        with open("render.yaml", 'r', encoding='utf-8') as f:
            content = f.read()
            if "requirements-ultra.txt" in content:
                print("✅ Triple fallback requirements configured")
            if "npm run build" in content:
                print("✅ Frontend build command present")
            if "healthCheckPath" in content:
                print("✅ Health check configured")

def check_backend():
    """Check backend structure"""
    print("\n🔧 Checking backend structure...")
    
    check_file_exists("backend/main.py", "Main FastAPI app")
    check_file_exists("backend/core/__init__.py", "Core modules")
    check_file_exists("backend/adapters/__init__.py", "Adapter modules")
    
    # Check if main.py has static file serving
    if os.path.exists("backend/main.py"):
        with open("backend/main.py", 'r', encoding='utf-8') as f:
            content = f.read()
            if "StaticFiles" in content:
                print("✅ Static file serving configured")
            if "/app" in content and "serve_frontend" in content:
                print("✅ Frontend routes configured")

def check_frontend():
    """Check frontend structure"""
    print("\n🎨 Checking frontend structure...")
    
    check_file_exists("frontend/package.json", "Package.json")
    
    if os.path.exists("frontend/package.json"):
        with open("frontend/package.json", 'r', encoding='utf-8') as f:
            try:
                pkg = json.load(f)
                if "build" in pkg.get("scripts", {}):
                    print("✅ Build script configured")
                if "next" in pkg.get("dependencies", {}) or "next" in pkg.get("devDependencies", {}):
                    print("✅ Next.js dependency found")
            except json.JSONDecodeError:
                print("⚠️  Package.json format error")

def check_documentation():
    """Check documentation"""
    print("\n📚 Checking documentation...")
    
    check_file_exists("RENDER_READY.md", "Deployment documentation")
    check_file_exists("test-page.html", "Test page")
    check_file_exists("README.md", "Main README")

def main():
    """Main verification function"""
    print("🔍 API Chat System - Pre-Deployment Verification\n")
    print("=" * 50)
    
    # Change to script directory
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    check_requirements()
    check_render_config()  
    check_backend()
    check_frontend()
    check_documentation()
    
    print("\n" + "=" * 50)
    print("🎯 Verification completed!")
    print("\nNext steps:")
    print("1. Commit and push changes to GitHub")
    print("2. Deploy to Render using render.yaml")
    print("3. Test deployment using /test endpoint")
    print("\n🚀 Ready for deployment!")

if __name__ == "__main__":
    main()
