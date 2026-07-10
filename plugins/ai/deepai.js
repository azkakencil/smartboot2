const axios = require('axios')

const pluginConfig = {
    name: 'deepai',
    alias: ['ai', 'ask'],
    category: 'ai',
    description: 'AI DEEP',
    usage: '.deepai <text>',
    cooldown: 3,
    isEnabled: true
}

// ─────────────────────────────
// PARSER AMAN
// ─────────────────────────────
function parseInput(m) {
    let text = ''

    if (m.args?.length) {
        text = m.args.join(' ')
    } else {
        text = (m.text || '').split(' ').slice(1).join(' ')
    }

    return text.replace(/\|/g, ' ').trim()
}

// ─────────────────────────────
// HANDLER
// ─────────────────────────────
async function handler(m) {
    try {
        const text = parseInput(m)

        if (!text) {
            return m.reply(
`🤖 *DEEP AI*

Contoh:
.deepai apa itu javascript`
            )
        }

        await m.react('🤖')

        // API BARU (sesuai request kamu)
        const url = `https://api-faa.my.id/faa/deep-ai?text=${encodeURIComponent(text)}`

        const res = await axios.get(url, {
            timeout: 60000,
            headers: {
                'User-Agent': 'Mozilla/5.0 Chrome/120'
            }
        })

        const data = res?.data

        console.log('[DEEP RAW]', data)

        // ─────────────────────────────
        // AMBIL RESPONSE FLEXIBLE
        // ─────────────────────────────
        const answer =
            data?.result ||
            data?.response ||
            data?.text ||
            data?.message ||
            (typeof data === 'string' ? data : null)

        if (!answer) {
            return m.reply(
`❌ AI tidak merespon

Debug:
${JSON.stringify(data).slice(0, 400)}`
            )
        }

        await m.reply(
`🤖 *DEEP AI*

${answer}`
        )

        m.react('✅')

    } catch (err) {
        console.error('[DEEPAI ERROR]', err)
        m.react('❌')

        return m.reply(
`❌ Error:
${err.message}`
        )
    }
}

module.exports = {
    config: pluginConfig,
    handler
}