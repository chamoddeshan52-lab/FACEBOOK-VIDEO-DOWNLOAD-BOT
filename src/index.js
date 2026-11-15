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
            // fdown හෝ ඒ හා සමාන සේවාවන් මෙන් වීඩියෝ ලින්ක් ලබා ගන්නා API එකක් භාවිතය
            const response = await fetch(`https://apis.davidcyriltech.my.id/facebook?url=${encodeURIComponent(text)}`);
            const data = await response.json();

            let videoUrl = null;
            if (data && data.success && data.result) {
              videoUrl = data.result.hd || data.result.sd || data.result.download_url;
            } else if (data && data.video_url) {
              videoUrl = data.video_url;
            }

            if (videoUrl) {
              await sendTelegramVideo(BOT_TOKEN, chatId, videoUrl, "මෙන්න ඔබේ වීඩියෝව! 🎥");
            } else {
              await sendTelegramMessage(BOT_TOKEN, chatId, "සමාවන්න, මෙම වීඩියෝවේ ඩවුන්ලෝඩ් ලින්ක් එක ලබා ගැනීමට නොහැකි විය. වෙනත් ලින්ක් එකක් උත්සාහ කරන්න.");
            }
          } catch (e) {
            await sendTelegramMessage(BOT_TOKEN, chatId, "දෝෂයක් ඇති විය: " + e.message);
          }

        } else {
          await sendTelegramMessage(BOT_TOKEN, chatId, "කරුණාකර නිවැරදි Facebook video link එකක් පමණක් එවන්න.");
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
