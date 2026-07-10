const axios = require('axios')
const sharp = require('sharp')

const pluginConfig = {
    name: 'bratglitch',
    alias: ['bg', 'glitchbrat'],
    category: 'sticker',
    description: 'Brat Anime jadi sticker (no crop)',
    usage: '.bratglitch <teks>',
    example: '.bratglitch Halo semuanya',
    cooldown: 10,
    isEnabled: true
}

// convert image ke sticker webp tanpa crop (fit contain)
async function toSticker(buffer) {
    return await sharp(buffer)
        .resize({
            width: 512,
            height: 512,
            fit: 'contain',        // ⬅️ penting: biar gambar TIDAK kepotong
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .webp({ quality: 90 })
        .toBuffer()
}

async function handler(m, { sock, args }) {
    try {
        const text = args.join(' ').trim()

        if (!text) {
            return m.reply(
`🎌 *BRAT GLITCH STICKER*

Contoh:
.${pluginConfig.name} Halo semuanya`
            )
        }

        await m.react('⌛')

        const res = await axios.get(
            'https://api.nexray.eu.cc/textpro/pixel-glitch',
            {
                params: { text },
                responseType: 'arraybuffer',
                timeout: 30000,
                validateStatus: () => true
            }
        )

        if (res.status !== 200) {
            throw new Error(`API Error (${res.status})`)
        }

        const type = res.headers['content-type'] || ''

        if (!type.startsWith('image/')) {
            throw new Error(Buffer.from(res.data).toString())
        }

        const imageBuffer = Buffer.from(res.data)

        // convert ke sticker tanpa crop
        const sticker = await toSticker(imageBuffer)

        await sock.sendMessage(m.chat, {
            sticker
        }, {
            quoted: m
        })

        await m.react('✅')

    } catch (err) {
        console.error(err)
        await m.react('❌')
        m.reply(`❌ Error:\n${err.message}`)
    }
}

module.exports = {
    config: pluginConfig,
    handler
}