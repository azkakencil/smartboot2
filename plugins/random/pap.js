const axios = require('axios')

const pluginConfig = {
    name: 'pap',
    alias: ['paprandom', 'randompap'],
    category: 'random',
    description: 'Mengirim PAP random',
    usage: '.pap',
    example: '.pap',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    isEnabled: true
}

async function handler(m, { sock }) {
    await m.react('📸')

    try {
        const res = await axios.get(
            'https://api-nanzz.my.id/docs/api/random/random-pap.php',
            {
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
            const err = Buffer.from(res.data).toString('utf8')
            throw new Error(err || 'Response bukan gambar.')
        }

        await sock.sendMessage(
            m.chat,
            {
                image: Buffer.from(res.data),
                caption:
`📸 *Random PAP*

Silakan gunakan dengan bijak.`
            },
            {
                quoted: m
            }
        )

        await m.react('✅')

    } catch (err) {
        console.error(err)

        await m.react('❌')

        m.reply(
`❌ Terjadi kesalahan.

${err.message}`)
    }
}

module.exports = {
    config: pluginConfig,
    handler
}