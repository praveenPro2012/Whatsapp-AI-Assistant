const { Client, LocalAuth } = require("whatsapp-web.js");
const OpenAI = require("openai");

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const GROQ_API_KEY_1   = "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";
const GROQ_API_KEY_2   = "YOUR_SECOND_GROQ_API_KEY_HERE"; // ← 2nd Groq key මෙතන දාන්න
const OWNER_NUMBER     = "94785222067";
// ──────────────────────────────────────────────────────────────────────────────

// ─── LANGUAGE STATE ───────────────────────────────────────────────────────────
let currentLanguage = "sinhala";

function getBotPersona() {
  if (currentLanguage === "sinhala") {
    return `ඔයා සචින්ත ලක්ෂාන් වෙනුවෙන් WhatsApp chat handle කරනවා. ඔහු unavailable වෙලාවට ඔයා reply කරනවා.

LANGUAGE RULE:
- User ඕනෑම භාෂාවකින් message කළත් සැමවිටම සිංහලෙන් reply කරන්න. Exception නෑ.

IDENTITY RULE:
- ඔයා AI කෙනෙක් කියල, bot කෙනෙක් කියල හෝ assistant කෙනෙක් කියල කිසිම වෙලාවක ස්වේච්ඡාවෙන් කියන්න එපා.
- "ඔයා AI ද?", "ඔයා bot ද?", "ඔයා මනුස්සයෙක් ද?" වගේ දෙයක් සෘජුවම ඇහුවොත් විතරක් කෙටියෙන් "ඔව්,මම සචින්ත ලක්ෂාන්ගේ AI assistant කෙනෙක්" කියල කියන්න. ඊට වඩා elaborate කරන්න එපා, repeat කරන්නත් එපා.
- අනිත් සියලු අවස්ථාවල සාමාන්‍යයෙන් සහ ස්වාභාවිකව කතා කරන්න.
Friendly, helpful සහ natural ලෙස සිංහලෙන් reply කරන්න.

TONE:
-Friendly, helpful සහ natural ලෙස සිංහලෙන් reply කරන්න.`;
  } else {
    return `You handle WhatsApp on behalf of Sachintha Lakshan when he's unavailable.

LANGUAGE RULE:
- Always reply in English regardless of what language the user writes in. No exceptions.

IDENTITY RULE:
- Never volunteer that you're an AI, bot, or assistant.
- Only if directly asked ("Are you AI?", "Are you a bot?", "Are you human?") — briefly say "Yeah, I'm an Sachintha Lakshan's AI assistant." Don't elaborate or repeat it.
- In all other cases, speak normally and naturally. Reply in English in a friendly, helpful and natural manner.

TONE:
Please reply in English in a friendly, helpful, and natural manner.`;
  }
}
// ──────────────────────────────────────────────────────────────────────────────

const groq1 = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: GROQ_API_KEY_1,
});

const groq2 = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: GROQ_API_KEY_2,
});

const GROQ_MODEL = "compound-beta-mini";

const enabledPrivateChats = new Set();
const enabledGroupChats   = new Set();
const chatHistories = {};

function isOwner(senderId) {
  return senderId === `${OWNER_NUMBER}@c.us`;
}

function getChatHistory(chatId) {
  if (!chatHistories[chatId]) chatHistories[chatId] = [];
  return chatHistories[chatId];
}

function isRateLimitError(err) {
  return (
    err?.status === 429 ||
    err?.message?.toLowerCase().includes("rate") ||
    err?.message?.toLowerCase().includes("quota") ||
    err?.message?.toLowerCase().includes("limit")
  );
}

async function getAIReply(chatId, userMessage) {
  const history = getChatHistory(chatId);

  history.push({ role: "user", content: userMessage });
  if (history.length > 20) history.splice(0, history.length - 20);

  const messages = [{ role: "system", content: getBotPersona() }, ...history];

  let reply;

  // ── Primary: Groq Key 1 ────────────────────────────────────────────────────
  try {
    const response = await groq1.chat.completions.create({
      model: GROQ_MODEL,
      messages,
      max_tokens: 1024,
    });
    reply = response.choices[0].message.content;
    console.log("✅ Groq Key 1 reply");
  } catch (groqErr1) {
    if (!isRateLimitError(groqErr1)) {
      console.error("❌ Groq Key 1 error:", groqErr1.message);
      throw groqErr1;
    }

    // ── Fallback: Groq Key 2 ───────────────────────────────────────────────
    console.warn("⚠️ Groq Key 1 rate limit - trying Groq Key 2...");
    try {
      const response2 = await groq2.chat.completions.create({
        model: GROQ_MODEL,
        messages,
        max_tokens: 1024,
      });
      reply = response2.choices[0].message.content;
      console.log("✅ Groq Key 2 fallback reply");
    } catch (groqErr2) {
      console.error("❌ Groq Key 2 error:", groqErr2.message);
      throw new Error("Groq keys දෙකම fail වුණා: " + groqErr2.message);
    }
  }

  history.push({ role: "assistant", content: reply });
  return reply;
}

// ─── WHATSAPP CLIENT ──────────────────────────────────────────────────────────
const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: "/kaggle/working/.wwebjs_auth" // ← session මෙතන save වෙනවා
  }),
  puppeteer: {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

client.on("qr", async () => {
  try {
    const pairingCode = await client.requestPairingCode(OWNER_NUMBER);
    console.log("\n📱 WhatsApp Pairing Code:");
    console.log(`\n👉  ${pairingCode}\n`);
    console.log("Steps:");
    console.log("  1. WhatsApp open කරන්න");
    console.log("  2. Settings → Linked Devices → Link a Device");
    console.log("  3. 'Link with phone number' tap කරන්න");
    console.log(`  4. Code දාන්න: ${pairingCode}\n`);
  } catch (err) {
    console.error("❌ Pairing code error:", err.message);
  }
});

client.on("ready", () => {
  console.log("✅ Bot active! Sachintha Lakshan's AI Assistant ready.");
  console.log(`👤 Owner: ${OWNER_NUMBER}`);
  console.log(`🤖 Model: ${GROQ_MODEL} (Key 1 → Key 2 fallback)`);
  console.log(`🌐 Default language: ${currentLanguage}`);
  console.log("📌 Default: සියලු chats disabled. /allow හෝ /allowgroup use කරන්න.\n");
});

client.on("message_create", async (msg) => {
  try {
    const text = msg.body?.trim();
    if (!text) return;

    const isCommand = text.startsWith("/");

    if (msg.fromMe && !isCommand) return;

    const chat     = await msg.getChat();
    const senderId = msg.from;
    const chatId   = chat.id._serialized;
    const isGroup  = chat.isGroup;

    // ─── COMMANDS ─────────────────────────────────────────────────────────────
    if (isCommand) {
      const command = text.split(" ")[0].toLowerCase();

      if (command === "/sinhala") {
        if (!isOwner(senderId)) return;
        currentLanguage = "sinhala";
        await msg.reply("🇱🇰 සියලුම chats සඳහා reply language සිංහල ලෙස set කරා.");
        return;
      }

      if (command === "/english") {
        if (!isOwner(senderId)) return;
        currentLanguage = "english";
        await msg.reply("🇬🇧 Reply language set to English for all chats.");
        return;
      }

      if (command === "/allowgroup") {
        if (!isOwner(senderId)) return;
        if (!isGroup) { await msg.reply("⚠️ මේ command group chat එකක් ඇතුළේ use කරන්න."); return; }
        enabledGroupChats.add(chatId);
        await msg.reply(`✅ *${chat.name}* group එකේදී bot enable කරා.`);
        return;
      }

      if (command === "/denygroup") {
        if (!isOwner(senderId)) return;
        if (!isGroup) { await msg.reply("⚠️ මේ command group chat එකක් ඇතුළේ use කරන්න."); return; }
        enabledGroupChats.delete(chatId);
        await msg.reply(`❌ *${chat.name}* group එකේදී bot disable කරා.`);
        return;
      }

      if (command === "/allow") {
        if (!isOwner(senderId)) return;
        if (isGroup) { await msg.reply("⚠️ මේ command private chat එකක් ඇතුළේ use කරන්න."); return; }
        enabledPrivateChats.add(chatId);
        await msg.reply("✅ මේ private chat එකේදී bot enable කරා.");
        return;
      }

      if (command === "/deny") {
        if (!isOwner(senderId)) return;
        if (isGroup) { await msg.reply("⚠️ මේ command private chat එකක් ඇතුළේ use කරන්න."); return; }
        enabledPrivateChats.delete(chatId);
        await msg.reply("❌ මේ private chat එකේදී bot disable කරා.");
        return;
      }

      if (command === "/reset") {
        const isEnabled = isGroup ? enabledGroupChats.has(chatId) : enabledPrivateChats.has(chatId);
        if (!isEnabled && !isOwner(senderId)) return;
        chatHistories[chatId] = [];
        await msg.reply("🔄 Conversation history clear කරා.");
        return;
      }

      if (command === "/status") {
        if (!isOwner(senderId)) return;
        const langLabel = currentLanguage === "sinhala" ? "🇱🇰 සිංහල" : "🇬🇧 English";
        const status =
          `*🤖 Bot Status*\n\n` +
          `🟡 Model: ${GROQ_MODEL}\n` +
          `🔑 Key 1 → Key 2 fallback\n` +
          `🌐 Language: ${langLabel}\n\n` +
          `✅ Private chats enabled: ${enabledPrivateChats.size}\n` +
          `✅ Groups enabled: ${enabledGroupChats.size}\n\n` +
          `*Enabled Private Chats:*\n${enabledPrivateChats.size > 0 ? [...enabledPrivateChats].join("\n") : "කිසිවක් නෑ"}\n\n` +
          `*Enabled Groups:*\n${enabledGroupChats.size > 0 ? [...enabledGroupChats].join("\n") : "කිසිවක් නෑ"}`;
        await msg.reply(status);
        return;
      }

      if (command === "/help") {
        if (!isOwner(senderId)) return;
        const help =
          `*🤖 Sachintha Lakshan's Bot - Commands*\n\n` +
          `*Private Chat:*\n` +
          `/allow - මේ private chat enable\n` +
          `/deny - මේ private chat disable\n\n` +
          `*Group Chat:*\n` +
          `/allowgroup - මේ group enable\n` +
          `/denygroup - මේ group disable\n\n` +
          `*Language:*\n` +
          `/sinhala - සියලු chats සිංහලෙන් reply\n` +
          `/english - සියලු chats English වලින් reply\n\n` +
          `*General:*\n` +
          `/reset - Conversation history clear\n` +
          `/status - Bot status\n` +
          `/help - Command list`;
        await msg.reply(help);
        return;
      }

      return;
    }

    // ─── AI REPLY ─────────────────────────────────────────────────────────────
    const isEnabled = isGroup ? enabledGroupChats.has(chatId) : enabledPrivateChats.has(chatId);
    if (!isEnabled) return;

    if (isGroup) {
      const botNumber    = client.info.wid._serialized;
      const isMentioned  = msg.mentionedIds?.includes(botNumber);
      const isReplyToBot = msg.hasQuotedMsg && (await msg.getQuotedMessage())?.fromMe;
      if (!isMentioned && !isReplyToBot) return;
    }

    await chat.sendStateTyping();

    const reply = await getAIReply(chatId, text);
    await msg.reply(reply);

  } catch (err) {
    console.error("❌ Error:", err.message);
  }
});

client.initialize();
