export default {
  async fetch(request, env, ctx) {
    if (request.method !== "POST") {
      return new Response("Bot is running!", { status: 200 });
    }

    try {
      const update = await request.json();
      
      if (update.message && update.message.text) {
        const chatId = update.message.chat.id;
        const text = update.message.text;

        if (text.startsWith("/start")) {
          await sendTelegramMessage(env.BOT_TOKEN, chatId, "Ayubowan! Magen Facebook videos download karaganna puluwan. Facebook video link eka mekata ewanna.");
        } else if (text.includes("facebook.com") || text.includes("fb.watch")) {
          await sendTelegramMessage(env.BOT_TOKEN, chatId, "Video eka process wenawa, poddak inna...");
          
          // Methanin Facebook video download link eka fetch karana logic eka danna puluwan (Free API ekak use karala)
          // Udaharanak widihata: SnapSave wage API ekak hari public downloader API ekak use karanna puluwan.
          
          await sendTelegramMessage(env.BOT_TOKEN, chatId, "Downloaded Link: [Me thanata video link eka enna hadanna]");
        } else {
          await sendTelegramMessage(env.BOT_TOKEN, chatId, "Kuru hari waradi link ekak. Valid Facebook video link ekak ewanna.");
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: text }),
  });
}
