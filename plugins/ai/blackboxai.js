const axios = require("axios");

const pluginConfig = {
    name: "blackboxai",
    alias: ["ai", "ask"],
    category: "ai",
    description: "BLACKBOX AI",
    usage: ".blackboxai <pertanyaan>",
    cooldown: 3,
    isEnabled: true
};

// ==============================
// Parser
// ==============================
function parseInput(m) {
    if (m.args?.length) {
        return m.args.join(" ").replace(/\|/g, " ").trim();
    }

    return (m.text || "")
        .split(" ")
        .slice(1)
        .join(" ")
        .replace(/\|/g, " ")
        .trim();
}

// ==============================
// Handler
// ==============================
async function handler(m) {
    const query = parseInput(m);

    if (!query) {
        return m.reply(`🤖 *BLACKBOX AI*

Contoh:
.blackboxai Apa itu JavaScript?`);
    }

    try {
        await m.react("🤖");

        const { data } = await axios.get(
            "https://api.neoxr.eu/api/blackbox",
            {
                params: {
                    q: query,
                    apikey: "lwzqVJ"
                },
                timeout: 60000,
                headers: {
                    "User-Agent": "Mozilla/5.0"
                }
            }
        );

        console.log("[BLACKBOX]", data);

        if (!data) {
            return m.reply("❌ Tidak ada response dari API.");
        }

        // Jika API memakai status
        if (data.status === false) {
            return m.reply(data.message || "❌ API mengembalikan error.");
        }

        // Ambil hasil dari berbagai kemungkinan format
        let answer =
            data.result ??
            data.response ??
            data.text ??
            data.message ??
            data.data?.result ??
            data.data?.response ??
            data.data?.text ??
            data.data?.message ??
            null;

        // Jika object
        if (typeof answer === "object" && answer !== null) {
            answer = JSON.stringify(answer, null, 2);
        }

        // Jika array
        if (Array.isArray(answer)) {
            answer = answer.join("\n");
        }

        if (!answer) {
            return m.reply(`❌ Response API tidak dikenali.

${JSON.stringify(data, null, 2).slice(0, 800)}`);
        }

        await m.reply(`🤖 *BLACKBOX AI*

${answer}`);

        await m.react("✅");

    } catch (err) {
        console.error("[BLACKBOX ERROR]", err);

        await m.react("❌");

        if (err.response) {
            return m.reply(`❌ API Error (${err.response.status})

${JSON.stringify(err.response.data, null, 2).slice(0, 800)}`);
        }

        return m.reply(`❌ Error

${err.message}`);
    }
}

module.exports = {
    config: pluginConfig,
    handler
};