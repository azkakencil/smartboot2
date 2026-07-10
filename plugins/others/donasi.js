const pluginConfig = {
    name: "donasi",
    alias: ["donate", "qris"],
    category: "others",
    description: "QRIS Donasi",
    usage: ".donasi",
    example: ".donasi",
    cooldown: 5,
    isEnabled: true
};

async function handler(m, { sock }) {
    try {
        await m.react("💖");

        const imageUrl = "https://i.ibb.co.com/j9yTPvPG/1782608735316.png"; // Ganti dengan URL gambar langsung

        const caption = `💖 *DONASI BOT*

Terima kasih telah menggunakan bot ini.

Silakan scan QRIS di atas untuk berdonasi.

🙏 Terima kasih atas supportnya.`;

        await sock.sendMessage(
            m.chat,
            {
                image: { url: imageUrl },
                caption
            },
            { quoted: m }
        );

        await m.react("✅");
    } catch (e) {
        console.error(e);
        await m.react("❌");
        m.reply("Gagal mengirim QRIS.");
    }
}

module.exports = {
    config: pluginConfig,
    handler
};