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
          await sendTelegramMessage(BOT_TOKEN, chatId, "ආයුබෝවන්! මගෙන් Facebook videos ඩවුන්ලෝඩ් කරගන්න පුළුවන්. ඕනෑම ප්‍රසිද්ධ (Public) Facebook video link එකක් මෙකට එවන්න.");
        } else if (text.includes("facebook.com") || text.includes("fb.watch") || text.includes("share/v")) {
          await sendTelegramMessage(BOT_TOKEN, chatId, "වීඩියෝ එක ප්‍රොසෙස් වෙමින් පවතී, ටිකක් ඉන්න...");
          
          try {
            // fdown.net වෙත POST request එකක් යවා ඩවුන්ලෝඩ් ලින්ක් එක ලබා ගැනීම
            const videoUrl = await fetchFDownVideo(text);

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

// fdown.net හරහා වීඩියෝ ලින්ක් එක ලබා ගන්නා ෆන්ක්ෂන් එක
async function fetchFDownVideo(fbUrl) {
  try {
    const formData = new URLSearchParams();
    formData.append("URL", fbUrl);

    const response = await fetch("https://fdown.net/download.php", {
      method: "POST",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Content-Type": "application/x-www-form-urlencoded",
        "Origin": "https://fdown.net",
        "Referer": "https://fdown.net/"
      },
      body: formData.toString()
    });

    const html = await response.text();

    // fdown රිזල්ට් පේජ් එකෙන් HD හෝ SD ලින්ක් එක Regex හරහා සොයා ගැනීම
    const hdMatch = html.match(/id="hdlink"[^>]*href="([^"]+)"/) || html.match(/href="([^"]+)"[^>]*id="hdlink"/);
    if (hdMatch && hdMatch[1]) {
      return hdMatch[1];
    }

    const sdMatch = html.match(/id="sdlink"[^>]*href="([^"]+)"/) || html.match(/href="([^"]+)"[^>]*id="sdlink"/);
    if (sdMatch && sdMatch[1]) {
      return sdMatch[1];
    }

    // වෙනත් සාමාන්‍ය ඩවුන්ලෝඩ් බටන් ලින්ක් පරීක්ෂා කිරීම
    const generalMatch = html.match(/class="btn btn-primary [^"]*"[^>]*href="([^"]+)"/);
    if (generalMatch && generalMatch[1]) {
      return generalMatch[1];
    }

    return null;
  } catch (error) {
    return null;
  }
}

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
