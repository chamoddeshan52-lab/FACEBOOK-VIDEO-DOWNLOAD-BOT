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
            // Web Scraping ක්‍රමය හරහා Facebook Page එකෙන් වීඩියෝ ලින්ක් එක ලබා ගැනීම
            const videoUrl = await scrapeFacebookVideo(text);

            if (videoUrl) {
              await sendTelegramVideo(BOT_TOKEN, chatId, videoUrl, "මෙන්න ඔබේ වීඩියෝව! 🎥");
            } else {
              await sendTelegramMessage(BOT_TOKEN, chatId, "සමාවන්න, මෙම වීඩියෝවේ ඩවුන්ලෝඩ් ලින්ක් එක ලබා ගැනීමට නොහැකි විය. (වීඩියෝව Private වෙන්න පුළුවන්)");
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

// Facebook Web Scraping Function
async function scrapeFacebookVideo(fbUrl) {
  try {
    // Facebook mobile version එක මඟින් HTML ස්ක්‍රේප් කරගැනීම (User-Agent එක මාරු කරමින්)
    const response = await fetch(fbUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/605.1.15",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      }
    });

    const html = await response.text();

    // Regular Expression හරහා HTML කේතය තුළ ඇති HD හෝ SD වීඩියෝ ලින්ක් එක (og:video හෝ mp4 URL) සොයා ගැනීම
    const hdMatch = html.match(/"browser_native_hd_url":"([^"]+)"/) || html.match(/hd_src:"([^"]+)"/);
    if (hdMatch && hdMatch[1]) {
      return hdMatch[1].replace(/\\u0025/g, '%').replace(/\\/g, '');
    }

    const sdMatch = html.match(/"browser_native_sd_url":"([^"]+)"/) || html.match(/sd_src:"([^"]+)"/);
    if (sdMatch && sdMatch[1]) {
      return sdMatch[1].replace(/\\u0025/g, '%').replace(/\\/g, '');
    }

    // වෙනත් පද්ධතිමය ටැග් පරීක්ෂා කිරීම (og:video)
    const ogVideoMatch = html.match(/property="og:video" content="([^"]+)"/);
    if (ogVideoMatch && ogVideoMatch[1]) {
      return ogVideoMatch[1].replace(/&amp;/g, '&');
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
