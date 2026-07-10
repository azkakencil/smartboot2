const axios = require("axios");

module.exports = {
    config: {
        name: "liriklagu",
        alias: ["lyrics"],
        category: "search",
        usage: ".liriklagu <judul lagu>",
        cooldown: 3,
        isEnabled: true
    },

    async handler(m) {
        try {

            const text = (m.text || "").trim();

            // ===============================
            // AMBIL QUERY (FIX 1 KATA / MULTI KATA)
            // ===============================
            const query = text.replace(/^\.liriklagu\s+/i, "").trim();

            if (!query) {
                return m.reply("❌ Masukkan judul lagu!\nContoh: .liriklagu sorry");
            }

            const apiUrl = `https://api-faa.my.id/faa/lyrics?q=${encodeURIComponent(query)}`;

            const res = await axios.get(apiUrl);
            const data = res.data;

            if (!data || !data.result) {
                return m.reply("❌ Lirik tidak ditemukan!");
            }

            const result = data.result;

            const title = result.title || query;
            const lyrics = result.lyrics || "Tidak ada lirik tersedia.";

            // ===============================
            // KIRIM TEKS PANJANG (ANTI LIMIT)
            // ===============================
            const sendLongText = async (text) => {
                const chunkSize = 3500;
                for (let i = 0; i < text.length; i += chunkSize) {
                    await m.reply(text.slice(i, i + chunkSize));
                }
            };

            const message =
`🎵 LIRIK LAGU

📌 Judul: ${title}

──────────────────
${lyrics}
`;

            await sendLongText(message);

        } catch (err) {
            console.error("[LYRICS ERROR]", err);
            return m.reply("❌ Terjadi kesalahan saat mengambil lirik!");
        }
    }
};