const axios = require('axios')
const sharp = require('sharp')

const pluginConfig = {
    name: 'bratphub',
    alias: ['phub', 'prnhub'],
    category: 'sticker',
    description: 'Membuat logo Pornhub menjadi sticker',
    usage: '.bratphub <teks1>|<teks2>',
    example: '.bratphub say|hai',
    cooldown: 10,
    isEnabled: true
}

// Convert image ke sticker WebP tanpa crop
async function toSticker(buffer) {
    return await sharp(buffer)
        .resize({
            width: 512,
            height: 512,
            fit: 'contain',
            background: {
                r: 0,
                g: 0,
                b: 0,
                alpha: 0
            }
        })
        .webp({
            quality: 90
        })
        .toBuffer()
}

async function handler(m, { sock, args }) {
    try {
        const input = args.join(' ').trim()

        if (!input) {
            return m.reply(
`🟧⬛ *BRAT PORNHUB STICKER*

Format:
.${pluginConfig.name} teks1|teks2

Contoh:
.${pluginConfig.example}`
            )
        }

        const [text1, text2] = input.split('|').map(v => v.trim())

        if (!text1 || !text2) {
            return m.reply(
`❌ Masukkan 2 teks.

Format:
.${pluginConfig.name} teks1|teks2

Contoh:
.${pluginConfig.example}`
            )
        }

        await m.react('⌛')

        const res = await axios.get(
            'https://api.nexray.eu.cc/textpro/pornhub',
            {
                params: {
                    text1,
                    text2
                },
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

        const sticker = await toSticker(imageBuffer)

        await sock.sendMessage(
            m.chat,
            {
                sticker
            },
            {
                quoted: m
            }
        )

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