const axios = require('axios')

const pluginConfig = {
    name: 'fakejago',
    alias: ['jago', 'bankjago'],
    category: 'canvas',
    description: 'Fake Bank Jago generator',
    usage: '.jago <nama> | <saldo>',
    example: '.jago smartgadget | 1000',
    cooldown: 10,
    isEnabled: true
}

// ─────────────────────────────
// ULTRA SMART PARSER
// ─────────────────────────────
function parseInput(m) {
    // gabungkan semua input biar aman
    let raw = ''

    if (Array.isArray(m.args) && m.args.length) {
        raw = m.args.join(' ')
    } else {
        raw = (m.text || '').split(' ').slice(1).join(' ')
    }

    raw = raw.replace(/\u200B/g, '').trim()

    let nama = ''
    let saldo = ''

    // CASE 1: ada |
    if (raw.includes('|')) {
        const parts = raw.split('|').map(v => v.trim())
        nama = parts[0]
        saldo = parts[1]
    }

    // CASE 2: tanpa |
    else {
        const match = raw.match(/(.+?)\s+(\d+)$/)
        if (match) {
            nama = match[1].trim()
            saldo = match[2].trim()
        }
    }

    return { nama, saldo }
}

// ─────────────────────────────
// HANDLER
// ─────────────────────────────
async function handler(m, { sock }) {
    try {
        const { nama, saldo } = parseInput(m)

        console.log('[DEBUG PARSE]', { nama, saldo })

        // ❗ hanya gagal kalau benar-benar kosong
        if (!nama || !saldo) {
            return m.reply(
`🏦 *FAKE BANK JAGO*

Format fleksibel:
✔ .jago nama | saldo
✔ .jago nama saldo

Contoh:
.jago smartgadget | 1000`
            )
        }

        if (!/^\d+$/.test(saldo)) {
            return m.reply('❌ Saldo harus angka')
        }

        const api = `https://api.nexray.eu.cc/maker/fakebank-jago?nama=${encodeURIComponent(nama)}&saldo=${encodeURIComponent(saldo)}`

        await m.react('⌛')

        const res = await axios.get(api, {
            responseType: 'arraybuffer',
            timeout: 30000,
            validateStatus: () => true
        })

        const buffer = Buffer.from(res.data)

        if (!buffer || buffer.length < 100) {
            return m.reply('❌ API gagal membuat gambar')
        }

        await sock.sendMessage(m.chat, {
            image: buffer,
            caption:
`🏦 *FAKE BANK JAGO*

👤 Nama: ${nama}
💰 Saldo: Rp${parseInt(saldo).toLocaleString('id-ID')}`
        }, { quoted: m })

        m.react('✅')

    } catch (err) {
        console.error('[JAGO ERROR]', err)
        m.react('❌')
        return m.reply(`❌ Error:\n${err.message}`)
    }
}

module.exports = {
    config: pluginConfig,
    handler
}
