#!/bin/bash

echo "🚀 Setting up WhatsApp DeepSeek Bot on Kaggle..."

# Node.js install
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Chromium install (puppeteer වලට)
echo "🌐 Installing Chromium..."
sudo apt-get install -y chromium-browser

# Project folder
echo "📁 Setting up project..."
mkdir -p /kaggle/working/whatsapp-bot
cp bot.js /kaggle/working/whatsapp-bot/
cp package.json /kaggle/working/whatsapp-bot/
cd /kaggle/working/whatsapp-bot

# npm packages install
echo "📦 Installing npm packages..."
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "▶️  Bot start කරන්න:"
echo "   cd /kaggle/working/whatsapp-bot && node bot.js"
echo ""
echo "📱 QR code scan කරන්න WhatsApp ලින්ක් කරන්න."
