export default {
  async fetch(request, env, ctx) {
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
          await sendTelegramMessage(BOT_TOKEN, chatId, "ආයුබෝවන්! මගෙන් Facebook videos ඩවුන්ලෝඩ් කරගන්න පුළුවන්. ඕනෑම ප්‍රසිද්ධ (Public) Facebook video link එකක් මෙකට එවන්න.");
        } else if (text.includes("facebook.com") || text.includes("fb.watch") || text.includes("share/v")) {
          await sendTelegramMessage(BOT_TOKEN, chatId, "වීඩියෝ එක ප්‍රොසෙස් වෙමින් පවතී, ටිකක් ඉන්න...");
          
          try {
            // Free API එකක් හරහා Facebook video download link එක ලබා ගැනීම
            const apiUrl = `https://api.socialapis.io/facebook/media/download?url=${encodeURIComponent(text)}`;
            
            // නැතහොත් වෙනත් නිදහස් endpoint එකක් පාවිච්චි කළ හැක. මෙහිදී අපි Direct download link එක යූසර්ට එවන්නෙමු.
            const response = await fetch(`https://apis.davidcyriltech.my.id/facebook?url=${encodeURIComponent(text)}`);
            const data = await response.json();

            if (data && (data.video_url || data.link || data.download_url)) {
              const videoUrl = data.video_url || data.link || data.download_url;
              
              // Telegram හරහා වීඩියෝව කෙලින්ම යැවීම (sendVideo)
              await sendTelegramVideo(BOT_TOKEN, chatId, videoUrl, "මෙන්න ඔබේ වීඩියෝව! 🎥");
            } else {
              // වීඩියෝ ලින්ක් එක ලබා ගැනීමට නොහැකි නම් Direct Link එක ලෙස යැවීම
              await sendTelegramMessage(BOT_TOKEN, chatId, "සමාවන්න, මෙම වීඩියෝව ඩවුන්ලෝඩ් කරගැනීමට නොහැකි විය. වෙනත් ලින්ක් එකක් උත්සාහ කරන්න.");
            }
          } catch (apiErr) {
            await sendTelegramMessage(BOT_TOKEN, chatId, "වීඩියෝ එක ලබා ගැනීමේදී දෝෂයක් ඇති විය: " + apiErr.message);
          }

        } else {
          await sendTelegramMessage(BOT_TOKEN, chatId, "කරුණාකර సరైన Facebook video link එකක් පමණක් එවන්න.");
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

async function sendTelegramVideo(token, chatId, videoUrl, caption) {
  const url = `https://api.telegram.org/bot${token}/sendVideo`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, video: videoUrl, caption: caption }),
  });
}
