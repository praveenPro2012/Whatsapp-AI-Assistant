# 🤖 WhatsApp AI Assistant

WhatsApp bot powered by Gemini & Groq AI.

---

## ⚙️ Setup (bot.js ඇතුළේ)

```js
const DEEPSEEK_API_KEY = "sk-xxx..."; // DeepSeek API key
const OWNER_NUMBER = "94xxxxxxxxx";   // ඔයාගේ number (+ නැතුව)
```

---

## 🚀 Kaggle වලදී Run කරන්න

**Notebook cell 1:**
```bash
%%bash
chmod +x setup.sh && bash setup.sh
```

**Notebook cell 2:**
```bash
%%bash
cd /kaggle/working/whatsapp-bot && node bot.js
```

QR code scan කරන්න → Bot active! 🟢

---

## 📋 Commands (Owner Only)

| Command | Location | Action |
|---|---|---|
| `/allow` | Private Chat | එම private chat enable |
| `/deny` | Private Chat | එම private chat disable |
| `/allowgroup` | Group Chat | එම group enable |
| `/denygroup` | Group Chat | එම group disable |
| `/reset` | Both | Conversation history clear |
| `/status` | Both | Bot status check |
| `/help` | Both | Command list |

---

## 📌 Behavior

- **Default:** සියලු chats (private + group) **disabled**
- **Groups:** Enable කළාට පස්සේ **@ mention හෝ reply** කළ messages ට පමණක් reply කරයි
- **Private:** Enable කළ chats වලට සෑම message එකකටම reply කරයි
- **Conversation memory:** Per-chat history (max 20 messages) maintain කරයි

---

## 📁 Files

```
whatsapp-deepseek-bot/
├── bot.js          # Main bot
├── package.json    # Dependencies
├── setup.sh        # Kaggle setup
└── README.md
```

Developed by Sachintha Lakshan
