export default {
  async fetch(request, env, ctx) {
    // මෙන්න මෙතැනට ඔබේ Telegram Bot Token එක කෙලින්ම දාලා තියෙන්නේ
    const BOT_TOKEN = "8209321918:AAEF3kvPAqbi78p40Tet7FfQwYZ0N_1fYro";

    if (request.method !== "POST") {
      return new Response("Bot is running!", { status: 200 });
    }

    try {
      const update = await request.json();
      
      if (update.message && update.message.text) {
        const chatId = update.message.chat.id;
        const text = update.message.text;

        if (text.startsWith("/start")) {
          await sendTelegramMessage(BOT_TOKEN, chatId, "ආයුබෝවන්! මගෙන් Facebook videos download කරගන්න පුළුවන්. Facebook video link එක මෙකට එවන්න.");
        } else if (text.includes("facebook.com") || text.includes("fb.watch")) {
          await sendTelegramMessage(BOT_TOKEN, chatId, "වීඩියෝ එක ප්‍රොසෙස් වෙමින් පවතී, ටිකක් ඉන්න...");
          
          // මෙතැනට Facebook video download logic එක දාන්න පුළුවන්
          
          await sendTelegramMessage(BOT_TOKEN, chatId, "Downloaded Link: [මෙතැනට වීඩියෝ ලින්ක් එක එන සේ සකස් කරගත හැක]");
        } else {
          await sendTelegramMessage(BOT_TOKEN, chatId, "කරුණාකර సరైన Facebook video link එකක් එවන්න.");
        }
      }

      return new Response("OK", { status: 200 });
    } catch (err) {
      return new Response("Error: " + err.message, { status: 500 });
    }
  },
};

async function sendTelegramMessage(token, chatId, text) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Type": "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: text }),
  });
}
