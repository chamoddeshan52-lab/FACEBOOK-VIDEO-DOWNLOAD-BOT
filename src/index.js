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
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              chat_id: chatId, 
              text: "ආයුබෝවන්! මගෙන් Facebook videos ඩවුන්ලෝඩ් කරගන්න පුළුවන්. ඕනෑම ප්‍රසිද්ධ (Public) Facebook video link එකක් මෙකට එවන්න." 
            })
          });
        } else if (text.includes("facebook.com") || text.includes("fb.watch") || text.includes("share/v")) {
          // ප්‍රථමයෙන් ප්‍රොසෙස් වෙමින් පවතී යැයි යැවීම
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text: "වීඩියෝ එක ප්‍රොසෙස් වෙමින් පවතී, ටිකක් ඉන්න..." })
          });

          try {
            const apiRes = await fetch(`https://kaiz-apis.gleeze.com/api/fbdown?url=${encodeURIComponent(text)}`);
            const data = await apiRes.json();

            let videoUrl = null;
            if (data && data.success && data.result) {
              videoUrl = data.result.HD || data.result.SD || data.result.download_url;
            } else if (data && data.url) {
              videoUrl = data.url;
            }

            if (videoUrl) {
              await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendVideo`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: chatId, video: videoUrl, caption: "මෙන්න ඔබේ වීඩියෝව! 🎥" })
              });
            } else {
              await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: chatId, text: "සමාවන්න, මෙම වීඩියෝවේ ඩවුන්ලෝඩ් ලින්ක් එක ලබා ගැනීමට නොහැකි විය." })
              });
            }
          } catch (e) {
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chat_id: chatId, text: "දෝෂයක් ඇති විය: " + e.message })
            });
          }

        } else {
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text: "කරුණාකර නිවැරදි Facebook video link එකක් පමණක් එවන්න." })
          });
        }
      }

      return new Response("OK", { status: 200 });
    } catch (err) {
      return new Response("Error: " + err.message, { status: 500 });
    }
  },
};
