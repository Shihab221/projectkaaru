# Setup Guide - PowerShell Execution Policy Fix

## Issue
PowerShell execution policy is blocking npm from running directly in PowerShell.

## Solutions

### Option 1: Use Command Prompt (cmd.exe) - Recommended ✅
Simply use Command Prompt instead of PowerShell:
```bash
cmd
npm run dev
```

### Option 2: Use PowerShell with Bypass
Run npm commands with explicit execution policy bypass:
```powershell
powershell -ExecutionPolicy Bypass -Command "npm run dev"
```

### Option 3: Fix PowerShell Execution Policy (Requires Admin)
1. Open PowerShell **as Administrator**
2. Run:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
3. Type `Y` when prompted
4. Restart PowerShell

### Option 4: Use the Batch File
Double-click `START-DEV.bat` to start the development server.

## Quick Start Commands

### Using cmd.exe:
```bash
# Start development server
cmd /c npm run dev

# Build project
cmd /c npm run build

# Run database seed
cmd /c npm run seed

# Install dependencies
cmd /c npm install
```

### Using PowerShell with Bypass:
```powershell
# Start development server
powershell -ExecutionPolicy Bypass -Command "npm run dev"

# Build project
powershell -ExecutionPolicy Bypass -Command "npm run build"

# Run database seed
powershell -ExecutionPolicy Bypass -Command "npm run seed"
```

## Notes
- npm is installed and working (version 11.6.2)
- All dependencies are installed
- Prisma client is generated
- Project builds successfully
- Use cmd.exe for the easiest experience
