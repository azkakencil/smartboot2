const axios = require('axios')

const pluginConfig = {
  name: 'rejekihokiweton',
  alias: ['weton', 'rejeki'],
  category: 'fun',
  description: 'Cek rejeki & hoki berdasarkan weton',
  usage: '.rejekihokiweton <tgl> | <bulan> | <tahun>',
  cooldown: 5,
  isEnabled: true,
}

async function handler(m, { sock }) {

  const text = (m.text || '').trim()

  // =========================
  // PARSING FIX (ANTI ERROR)
  // =========================
  const input = text.replace(/\.rejekihokiweton|\.weton|\.rejeki/i, '').trim()

  const parts = input.split('|').map(v => v.trim())

  const tgl = Number(parts[0])
  const bulan = Number(parts[1])
  const tahun = Number(parts[2])

  // =========================
  // VALIDASI (FIXED)
  // =========================
  if (
    !parts[0] || !parts[1] || !parts[2] ||
    isNaN(tgl) || isNaN(bulan) || isNaN(tahun)
  ) {
    return m.reply(
`❌ Format salah!

Gunakan:
.rejekihokiweton 28 | 6 | 2013`
    )
  }

  if (tgl < 1 || tgl > 31)
    return m.reply('❌ Tanggal tidak valid')

  if (bulan < 1 || bulan > 12)
    return m.reply('❌ Bulan tidak valid')

  if (tahun < 1900)
    return m.reply('❌ Tahun tidak valid')

  // =========================
  // API REQUEST
  // =========================
  let res
  try {
    res = await axios.get(
      `https://api.nexray.eu.cc/primbon/rejekihoki-weton?tanggal=${tgl}&bulan=${bulan}&tahun=${tahun}`,
      { timeout: 10000 }
    )
  } catch {
    return m.reply('❌ Gagal mengambil data API')
  }

  const data = res.data
  const result = data?.result || data?.data || data

  return m.reply(
`🔮 *REJEKI HOKI WETON*

📅 ${tgl}-${bulan}-${tahun}

✨ Hasil:
${result?.rejeki || result?.hoki || result?.deskripsi || JSON.stringify(result, null, 2)}`
  )
}

module.exports = {
  config: pluginConfig,
  handler
}