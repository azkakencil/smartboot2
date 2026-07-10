const axios = require('axios')

const pluginConfig = {
    name: 'artinama',
    alias: ['artinama', 'maknanama'],
    category: 'fun',
    description: 'Mengetahui arti nama berdasarkan primbon.',
    usage: '.artinama <nama>',
    example: '.artinama Muhammad Rizky',
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    try {
        const name = (m.args || []).join(' ').trim()

        if (!name) {
            return m.reply(
`🔮 *ARTI NAMA*

Masukkan nama yang ingin dicari artinya.

Contoh:
.artinama Muhammad Rizky`
            )
        }

        m.react('🔮')

        const { data } = await axios.get(
            `https://api.nexray.eu.cc/primbon/artinama?name=${encodeURIComponent(name)}`,
            {
                timeout: 15000,
                validateStatus: () => true
            }
        )

        if (!data) {
            return m.reply('❌ Tidak ada respon dari API.')
        }

        if (data.status === false) {
            return m.reply(data.message || '❌ Gagal mengambil data.')
        }

        const result = data.result || data.data || {}

        const nama =
            result.name ||
            result.nama ||
            name

        const arti =
            result.arti ||
            result.meaning ||
            result.result ||
            result.description ||
            'Tidak ada keterangan.'

        const karakter =
            result.karakter ||
            result.character ||
            result.kepribadian ||
            '-'

        const keberuntungan =
            result.keberuntungan ||
            result.luck ||
            '-'

        await m.reply(
`🔮 *ARTI NAMA*

👤 Nama
${nama}

📖 Arti
${arti}

✨ Karakter
${karakter}

🍀 Keberuntungan
${keberuntungan}`
        )

        m.react('✅')

    } catch (err) {
        console.error(err)

        m.react('❌')

        m.reply(
`❌ Gagal mengambil data.

Silakan coba lagi beberapa saat lagi.`
        )
    }
}

module.exports = {
    config: pluginConfig,
    handler
}