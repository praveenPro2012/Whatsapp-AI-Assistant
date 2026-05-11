<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=25D366&height=200&section=header&text=WhatsApp%20AI%20Bot&fontSize=50&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=සචින්ත%20ලක්ෂාන්ගේ%20පෞද්ගලික%20AI%20Assistant&descAlignY=55&descAlign=50" width="100%"/>

<br/>

[![WhatsApp](https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://www.whatsapp.com)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Groq AI](https://img.shields.io/badge/Groq_AI-FF6B35?style=for-the-badge&logoColor=white)](https://groq.com)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

<br/>

> 🤖 **ඔබ නොසිටින වේලාවට WhatsApp messages වලට Groq AI ගෙන් auto-reply කරන bot එකක්**
>
> ද්විභාෂා • රහස්‍ය • දක්ෂ • සැමවිටම Online

<br/>

</div>

---

## 🌟 මේක කරන්නේ මොකද?

ඔබ unavailable වෙලාවට, මේ bot එක ඔබ වෙනුවෙන් WhatsApp messages handle කරනවා — **English හෝ සිංහලෙන්** ස්වාභාවිකව reply කරනවා, conversation history මතක තියාගන්නවා, සහ කෙනෙක් සෘජුවම ඇහුවොත් විතරක් AI කෙනෙක් බව කියනවා.

---

## ✨ විශේෂාංග

<table>
<tr>
<td>

### 🧠 බුද්ධිය
- **Groq `compound-beta-mini`** model එකෙන් powered
- Chat එකකට messages **20ක් දක්වා** මතක තියාගන්නවා
- Context-aware, ස්වාභාවික replies

</td>
<td>

### 🔒 පාලනය
- **Owner-only** command system
- **Chat එකකට** හෝ **සියල්ලටම** enable/disable
- **Group chats** වල කිසිවිටෙකත් reply නොකරයි

</td>
</tr>
<tr>
<td>

### 🌐 ද්විභාෂා
- **English** 🇬🇧 හෝ **සිංහල** 🇱🇰 දෙකෙන්ම reply
- ඕනෑම වෙලාවක language switch කරන්න පුළුවන්
- User ඕනෑම භාෂාවකින් ලිව්වත් ගැටළුවක් නෑ

</td>
<td>

### ⚡ විශ්වාසදායිත්වය
- **API Key 2ක්** — fallback system
- Key 1 rate limit වුණොත් Key 2 auto-switch
- Error handling සහිතව

</td>
</tr>
</table>

---

## 📁 ගොනු ව්‍යූහය

```
📦 whatsapp-ai-bot
 ┣ 📜 bot.js               ← ප්‍රධාන bot logic
 ┣ 📜 setup.sh             ← Setup script
 ┣ 📜 package.json         ← Dependencies
 ┣ 📜 package-lock.json
 ┣ 📜 LICENSE
 ┣ 📜 README.md
 ┗ 📁 .wwebjs_auth/        ← WhatsApp session (auto-generate වෙනවා)
```

---

## 🚀 පටන් ගන්නේ කොහොමද?

### 1️⃣ Clone කරලා Install කරන්න

```bash
git clone https://github.com/your-username/whatsapp-ai-bot.git
cd whatsapp-ai-bot
bash setup.sh
```

හෝ manually:

```bash
npm install
```

### 2️⃣ Configure කරන්න

`bot.js` file එක open කරලා ඉහළින්ම config section එක update කරන්න:

```js
// ─── CONFIG ───────────────────────────────────────────
const GROQ_API_KEY_1 = "ඔබේ_primary_groq_key";
const GROQ_API_KEY_2 = "ඔබේ_fallback_groq_key";
const OWNER_NUMBER   = "94XXXXXXXXX";   // + හෝ spaces නොදාන්න
// ──────────────────────────────────────────────────────
```

> 🔑 Groq API key නොමිලේ ගන්න → [console.groq.com](https://console.groq.com)

### 3️⃣ Run කරන්න

```bash
node bot.js
```

### 4️⃣ WhatsApp Link කරන්න

Terminal එකේ **pairing code** එකක් පෙන්නයි. ඊට පස්සේ:

```
WhatsApp → Settings → Linked Devices → Link a Device → Link with phone number
```

---

## 🛠️ Commands

> ⚠️ සියලු commands **owner ට විතරයි**

| Command | විස්තරය |
|:---:|:---|
| `/allow` | ✅ **මේ** chat එකේ bot enable කරන්න |
| `/deny` | ❌ **මේ** chat එකේ bot disable කරන්න |
| `/allowall` | 🌐 **සියලු** private chats enable කරන්න |
| `/denyall` | 🚫 සියලු chats disable කරලා list clear කරන්න |
| `/sinhala` | 🇱🇰 Reply language **සිංහලට** switch කරන්න |
| `/english` | 🇬🇧 Reply language **English ට** switch කරන්න |
| `/reset` | 🔄 මේ chat එකේ conversation history clear කරන්න |
| `/status` | 📊 Bot status සහ enabled chats බලන්න |
| `/help` | 📋 Command list බලන්න |

---

## ⚙️ වැඩ කරන විදිය

```
 📩 Message එකක් ලැබුණා
         │
         ├─── Group Chat ද? ────────────► 🚫 Ignore
         │
         ├─── Bot Enable ද මේ Chat එකට? ► 🚫 Enable නැත්නම් Ignore
         │
         ▼
  🤖 AI Prompt හදනවා
  (Persona + Chat History + නව Message)
         │
         ▼
  📡 Groq API Call කරනවා (Key 1)
         │
         ├─── Rate Limit වුණාද? ────────► 📡 Key 2 ගෙන් Retry
         │
         ▼
  💬 WhatsApp ට Reply යවනවා
```

---

## 🌐 භාෂා Modles

| Mode | User ලිවූ භාෂාව | Bot Reply කරන භාෂාව |
|:---:|:---:|:---:|
| 🇬🇧 English *(default)* | ඕනෑම භාෂාවකින් | සැමවිටම English |
| 🇱🇰 සිංහල | ඕනෑම භාෂාවකින් | සැමවිටම සිංහල |

---

## 📦 Dependencies

| Package | කාර්යය |
|---|---|
| `whatsapp-web.js` | WhatsApp Web automation |
| `openai` | Groq API client (OpenAI-compatible) |
| `puppeteer` | Headless browser engine |

---

## ⚠️ වගකීම් සීමාව

මෙය **පෞද්ගලික භාවිතය සඳහා පමණි**. Automated messaging [WhatsApp Terms of Service](https://www.whatsapp.com/legal/terms-of-service) උල්ලංඝනය කළ හැකිය. වගකීමෙන් භාවිත කරන්න.

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=25D366&height=120&section=footer&animation=fadeIn" width="100%"/>

**❤️ සචින්ත ලක්ෂාන් විසින් නිර්මාණය කරන ලදී**

⭐ *ප්‍රයෝජනවත් වුණා නම් Star එකක් දාන්න!* ⭐

</div>
