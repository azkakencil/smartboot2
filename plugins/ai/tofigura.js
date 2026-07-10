const axios = require('axios')
const FormData = require('form-data')

const pluginConfig = {
    name: 'tofigure',
    alias: ['fgr'],
    category: 'ai',
    description: 'Membuat efek Figure',
    usage: '.tofigure (reply gambar)',
    example: '.tofigure',
    cooldown: 15,
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
            maxBodyLength: Infinity,
            maxContentLength: Infinity
        }
    )

    const url =
        data?.files?.[0]?.url ||
        data?.result?.url ||
        data?.url

    if (!url) {
        throw new Error('Uploader gagal mengembalikan URL.')
    }

    return url
}

async function handler(m, { sock }) {
    try {
        const isQuotedImage = m.quoted?.isImage
        const isImage = m.isImage

        if (!isQuotedImage && !isImage) {
            return m.reply(
                `*FIGURE*\n\n` +
                `Reply atau kirim gambar dengan caption:\n` +
                `.${pluginConfig.name}`
            )
        }

        await m.react('⌛')

        const buffer = isQuotedImage
            ? await m.quoted.download()
            : await m.download()

        if (!buffer || !Buffer.isBuffer(buffer)) {
            throw new Error('Gagal mengambil gambar.')
        }

        // Upload gambar
        const imageUrl = await uploadImage(buffer)

        // Request API Figure
        const res = await axios.get(
            'https://api.nexray.eu.cc/ephoto/v1/figure',
            {
                params: {
                    url: imageUrl // ubah menjadi image jika API menggunakan parameter image
                },
                responseType: 'arraybuffer',
                timeout: 60000,
                validateStatus: () => true
            }
        )

        const contentType = res.headers['content-type'] || ''

        if (!contentType.startsWith('image/')) {
            throw new Error(Buffer.from(res.data).toString('utf8'))
        }

        await sock.sendMessage(
            m.chat,
            {
                image: Buffer.from(res.data),
                caption: '✅ *Berhasil membuat Figure!*'
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
            `❌ Terjadi kesalahan.\n\n${err.message}`
        )
    }
}

module.exports = {
    config: pluginConfig,
    handler
}