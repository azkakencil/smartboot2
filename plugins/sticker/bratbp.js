const axios = require('axios')
const sharp = require('sharp')

const pluginConfig = {
    name: 'bratbp',
    alias: ['bratbp', 'bp'],
    category: 'sticker',
    description: 'Blackpink text sticker (full sticker)',
    usage: '.bratbp <text>',
    cooldown: 5,
    isEnabled: true
}

const UA = 'Mozilla/5.0 Chrome/120'

// ─────────────────────────────
// PARSER SAFE
// ─────────────────────────────
function parseInput(m) {
    let text = ''

    if (m.args?.length) {
        text = m.args.join(' ')
    } else {
        text = (m.text || '').split(' ').slice(1).join(' ')
    }

    return text.trim()
}

// ─────────────────────────────
// CONVERT IMAGE → STICKER (WEBP)
// ─────────────────────────────
async function toSticker(buffer) {
    return await sharp(buffer)
        .resize(512, 512, {
            fit: 'cover',     // 🔥 bikin stiker full (tidak gepeng)
            position: 'center'
        })
        .webp({ quality: 90 })
        .toBuffer()
}

// ─────────────────────────────
// HANDLER
// ─────────────────────────────
async function handler(m, { sock }) {
    try {
        const text = parseInput(m)

        if (!text) {
            return m.reply(
`🌸 BLACKPINK STICKER

Format:
.bratbp <text>

Contoh:
.bratbp hello world`
            )
        }

        await m.react('⏳')

        const url = `https://api.nexray.eu.cc/textpro/blackpink?text=${encodeURIComponent(text)}`

        // ambil gambar dari API
        const res = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 30000,
            headers: { 'User-Agent': UA },
            validateStatus: () => true
        })

        const imageBuffer = Buffer.from(res.data)

        if (!imageBuffer || imageBuffer.length < 100) {
            return m.reply('❌ Gagal generate gambar dari API')
        }

        // 🔥 CONVERT KE STICKER UTUH
        const stickerBuffer = await toSticker(imageBuffer)

        await sock.sendMessage(m.chat, {
            sticker: stickerBuffer
        }, { quoted: m })

        await m.react('✅')

    } catch (err) {
        console.error('[BRATBP ERROR]', err)
        await m.react('❌')
        return m.reply(`❌ Error:\n${err.message}`)
    }
}

module.exports = {
    config: pluginConfig,
    handler
}