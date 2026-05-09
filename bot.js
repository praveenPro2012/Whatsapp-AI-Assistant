const { Client, LocalAuth } = require("whatsapp-web.js");
const OpenAI = require("openai");

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const GEMINI_API_KEY  = "AIzaSyB4n7wg1stQX4EZqY6k0q0RTPTho_pFnNU"; // ← Gemini API key
const GROQ_API_KEY    = "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"; // ← Groq API key
const OWNER_NUMBER    = "94785222067"; // ← ඔයාගේ number (country code සහිතව, + නැතුව)

const BOT_PERSONA = `You are a helpful AI assistant representing Sachintha Lakshan.
You speak on behalf of Sachintha Lakshan when he is unavailable.
Be friendly, helpful, and natural in conversation.
If asked who you are, say you are Sachintha Lakshan's AI assistant.
Reply in the same language the user messages you in.`;
// ──────────────────────────────────────────────────────────────────────────────

// Gemini - OpenAI-compatible endpoint use කරනවා
const gemini = new OpenAI({
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  apiKey: GEMINI_API_KEY,
});

// Groq - OpenAI-compatible
const groq = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: GROQ_API_KEY,
});

const GEMINI_MODEL = "gemini-2.0-flash";
const GROQ_MODEL   = "llama-3.3-70b-versatile"; // Sinhala support ඇති model

// enabled chats store කරන්නේ Set දෙකක් - private සහ group වෙනම
const enabledPrivateChats = new Set();
const enabledGroupChats   = new Set();

// per-chat conversation history (OpenAI format)
const chatHistories = {};

function isOwner(senderId) {
  return senderId === `${OWNER_NUMBER}@c.us`;
}

function getChatHistory(chatId) {
  if (!chatHistories[chatId]) chatHistories[chatId] = [];
  return chatHistories[chatId];
}

async function getAIReply(chatId, userMessage) {
  const history = getChatHistory(chatId);

  history.push({ role: "user", content: userMessage });

  // History 20 messages වලට limit (memory save)
  if (history.length > 20) history.splice(0, history.length - 20);

  const messages = [{ role: "system", content: BOT_PERSONA }, ...history];

  let reply;

  // ── Primary: Gemini 2.5 Flash ──────────────────────────────────────────────
  try {
    const response = await gemini.chat.completions.create({
      model: GEMINI_MODEL,
      messages,
      max_tokens: 1024,
    });
    reply = response.choices[0].message.content;
    console.log("✅ Gemini reply");
  } catch (err) {
    const isRateLimit =
      err?.status === 429 ||
      err?.message?.toLowerCase().includes("rate") ||
      err?.message?.toLowerCase().includes("quota") ||
      err?.message?.toLowerCase().includes("limit");

    if (isRateLimit) {
      // ── Fallback: Groq ───────────────────────────────────────────────────
      console.warn("⚠️ Gemini rate limit hit - Groq fallback...");
      try {
        const groqResponse = await groq.chat.completions.create({
          model: GROQ_MODEL,
          messages,
          max_tokens: 1024,
        });
        reply = groqResponse.choices[0].message.content;
        console.log("✅ Groq fallback reply");
      } catch (groqErr) {
        console.error("❌ Groq error:", groqErr.message);
        throw new Error("දෙකම fail වුණා: " + groqErr.message);
      }
    } else {
      console.error("❌ Gemini error:", err.message);
      throw err;
    }
  }

  history.push({ role: "assistant", content: reply });
  return reply;
}

// ─── WHATSAPP CLIENT ──────────────────────────────────────────────────────────
const client = new Client({
  authStrategy: new LocalAuth(),
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
  console.log(`🤖 Primary: ${GEMINI_MODEL} | Fallback: ${GROQ_MODEL}`);
  console.log("📌 Default: සියලු chats disabled. /allow හෝ /allowgroup use කරන්න.\n");
});

client.on("message_create", async (msg) => {
  try {
    const chat     = await msg.getChat();
    const senderId = msg.from;
    const chatId   = chat.id._serialized;
    const isGroup  = chat.isGroup;
    const text     = msg.body?.trim();

    if (!text) return;

    // ─── COMMANDS ────────────────────────────────────────────────────────────
    if (text.startsWith("/")) {
      const command = text.split(" ")[0].toLowerCase();

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
        const status =
          `*🤖 Bot Status*\n\n` +
          `🔵 Primary: ${GEMINI_MODEL}\n` +
          `🟡 Fallback: ${GROQ_MODEL}\n\n` +
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
          `*General:*\n` +
          `/reset - Conversation history clear\n` +
          `/status - Bot status\n` +
          `/help - Command list`;
        await msg.reply(help);
        return;
      }

      return; // unknown command ignore
    }

    // ─── AI REPLY ─────────────────────────────────────────────────────────────
    const isEnabled = isGroup ? enabledGroupChats.has(chatId) : enabledPrivateChats.has(chatId);
    if (!isEnabled) return;

    // Group වලදී @ mention හෝ bot reply විතරක් respond කරයි
    if (isGroup) {
      const botNumber  = client.info.wid._serialized;
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
