#!/bin/bash
set -e

echo "Next.js Project Deployment Started ..."

# Pull the latest changes from the repository
git fetch origin main
echo "🔄 Resetting to origin/main (discarding local changes)..."
git reset --hard origin/main
git clean -fd
echo "✅ Repository is now up to date with origin/main."

# Load NVM in non-interactive shells used by CI/SSH deploys.
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"

if [ -s "$NVM_DIR/nvm.sh" ]; then
	# shellcheck disable=SC1090
	. "$NVM_DIR/nvm.sh"
elif [ -s "/usr/local/nvm/nvm.sh" ]; then
	# shellcheck disable=SC1091
	. "/usr/local/nvm/nvm.sh"
fi

if command -v nvm >/dev/null 2>&1; then
	if [ -f ".nvmrc" ]; then
		nvm install >/dev/null
		nvm use >/dev/null
	else
		nvm use --lts >/dev/null || true
	fi
fi

if ! command -v npm >/dev/null 2>&1; then
	echo "❌ npm not found. Ensure Node.js is installed and NVM is configured for this user."
	exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm ci --no-audit --prefer-offline --legacy-peer-deps

# Rebuild sharp for the correct platform
# echo "Rebuilding sharp module for platform compatibility..."
# npm rebuild sharp --verbose

# Build the Next.js project
echo "Building the Next.js project..."
npm run build

# Restart the Next.js app using systemd
echo "Restarting the Next.js app..."
systemctl restart nextjs_pkaru 

echo "checking the status of the Next.js app..."
systemctl status nextjs_pkaru --no-pager

echo "Deployment successful! Project is live."
echo "Next.js Project Deployment Finished!"