const axios = require('axios')
const FormData = require('form-data')

const pluginConfig = {
    name: 'wasted',
    alias: ['rip', 'wst'],
    category: 'canvas',
    description: 'Efek Wasted GTA',
    usage: '.wasted (reply gambar)',
    example: '.wasted',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    isEnabled: true
}

async function uploadImage(buffer) {
    const form = new FormData()

    form.append('files[]', buffer, {
        filename: 'image.jpg',
        contentType: 'image/jpeg'
    })

    const { data } = await axios.post(
        'https://api.nexadev.my.id/uploder/',
        form,
        {
            headers: form.getHeaders(),
            timeout: 30000,
            maxBodyLength: Infinity
        }
    )

    const url =
        data?.files?.[0]?.url ||
        data?.result?.url ||
        data?.url

    if (!url) throw new Error('Upload gambar gagal.')

    return url
}

async function handler(m, { sock }) {
    try {
        const quoted = m.quoted?.isImage
        const image = m.isImage

        if (!quoted && !image) {
            return m.reply(
                `🖼️ *WASTED EDITOR*\n\n` +
                `Reply atau kirim gambar dengan caption:\n` +
                `.${pluginConfig.name}`
            )
        }

        await m.react('⌛')

        const buffer = quoted
            ? await m.quoted.download()
            : await m.download()

        if (!buffer || !Buffer.isBuffer(buffer)) {
            throw new Error('Gagal mengambil gambar.')
        }

        const imageUrl = await uploadImage(buffer)

        const res = await axios.get(
            'https://api.nexray.eu.cc/editor/wasted',
            {
                params: {
                    url: imageUrl
                },
                responseType: 'arraybuffer',
                timeout: 30000,
                validateStatus: () => true
            }
        )

        const contentType = res.headers['content-type'] || ''

        if (!contentType.startsWith('image/')) {
            const err = Buffer.from(res.data).toString('utf8')
            throw new Error(err || 'API tidak mengembalikan gambar.')
        }

        await sock.sendMessage(
            m.chat,
            {
                image: Buffer.from(res.data),
                caption: '💀 *WASTED*'
            },
            {
                quoted: m
            }
        )

        await m.react('✅')

    } catch (err) {
        console.error(err)

        await m.react('❌')
        m.reply(`❌ Error!\n\n${err.message}`)
    }
}

module.exports = {
    config: pluginConfig,
    handler
}