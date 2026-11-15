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
        const text = update.message.text.trim();

        if (text.startsWith("/start")) {
          await sendTelegramMessage(BOT_TOKEN, chatId, "ආයුබෝවන්! මගෙන් Facebook videos ඩවුන්ලෝඩ් කරගන්න පුළුවන්. ඕනෑම ප්‍රසිද්ධ (Public) Facebook video, reel හෝ watch ලින්ක් එකක් මෙකට එවන්න.");
        } else if (text.includes("facebook.com") || text.includes("fb.watch") || text.includes("fb.share")) {
          await sendTelegramMessage(BOT_TOKEN, chatId, "වීඩියෝ එක ප්‍රොසෙස් වෙමින් පවතී, ටිකක් ඉන්න...");
          
          try {
            // වෙනත් ස්ථාවර සහ විශ්වාසදායක Facebook Downloader API එකක් භාවිතය
            const apiUrl = `https://bk9.fun/download/fbdown?url=${encodeURIComponent(text)}`;
            const response = await fetch(apiUrl);
            const data = await response.json();

            let videoUrl = null;
            if (data && data.status && data.result) {
              // HD හෝ SD ලින්ක් එක ලබා ගැනීම
              videoUrl = data.result.HD || data.result.SD || data.result.url;
            }

            // වෙනත් විකල්ප API එකක් මඟින් පරීක්ෂා කිරීම (මුල් එකෙන් නොලැබුනහොත්)
            if (!videoUrl) {
              const altResponse = await fetch(`https://api.siputzx.my.id/api/d/fbdown?url=${encodeURIComponent(text)}`);
              const altData = await altResponse.json();
              if (altData && altData.status && altData.data) {
                videoUrl = altData.data.hd || altData.data.sd;
              }
            }

            if (videoUrl) {
              await sendTelegramVideo(BOT_TOKEN, chatId, videoUrl, "මෙන්න ඔබේ වීඩියෝව! 🎥");
            } else {
              await sendTelegramMessage(BOT_TOKEN, chatId, "සමාවන්න, මෙම වීඩියෝවේ ඩවුන්ලෝඩ් ලින්ක් එක ලබා ගැනීමට නොහැකි විය. වීඩියෝව Private (පෞද්ගලික) එකක් විය හැක.");
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
