const satuan = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan"]
const belasan = ["sepuluh", "sebelas", "dua belas", "tiga belas", "empat belas", "lima belas", "enam belas", "tujuh belas", "delapan belas", "sembilan belas"]
const puluhan = ["", "", "dua puluh", "tiga puluh", "empat puluh", "lima puluh", "enam puluh", "tujuh puluh", "delapan puluh", "sembilan puluh"]

function terbilangRatusan(n: number): string {
  if (n === 0) return ""
  let result = ""
  if (n >= 100) {
    if (n >= 200) {
      result += satuan[Math.floor(n / 100)] + " ratus "
    } else {
      result += "seratus "
    }
    n %= 100
  }
  if (n >= 20) {
    result += puluhan[Math.floor(n / 10)] + " "
    n %= 10
  } else if (n >= 10) {
    result += belasan[n - 10] + " "
    return result.trim()
  }
  if (n > 0) {
    result += satuan[n] + " "
  }
  return result.trim()
}

export function terbilang(n: number): string {
  if (n === 0) return "Nol Rupiah"

  let result = ""
  const satuanBesar = ["", "ribu", "juta", "miliar", "triliun"]
  let chunkIndex = 0

  while (n > 0) {
    const chunk = n % 1000
    if (chunk > 0) {
      const words = terbilangRatusan(chunk)
      if (chunkIndex === 1 && chunk === 1) {
        result = "seribu " + result
      } else {
        result = words + " " + satuanBesar[chunkIndex] + " " + result
      }
    }
    n = Math.floor(n / 1000)
    chunkIndex++
  }

  const output = result.trim() + " rupiah"
  return output.replace(/\b\w/g, (c) => c.toUpperCase())
}
