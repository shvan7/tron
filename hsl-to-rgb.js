const toInt = (r, g, b) => (r << 16) | (g << 8) | b
const toRange = n => Math.round(n * 0xFF)
const hue2rgb = (p, q, t) => {
  if(t < 0) t += 1
  if(t > 1) t -= 1
  if(t < 1/6) return p + (q - p) * 6 * t
  if(t < 1/2) return q
  if(t < 2/3) return p + (q - p) * (2/3 - t) * 6
  return p
}

const hslToRgb = (h, s, l) => {
  if (!s) return toInt(toRange(l), toRange(l), toRange(l))

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  const r = hue2rgb(p, q, h + 1/3)
  const g = hue2rgb(p, q, h)
  const b = hue2rgb(p, q, h - 1/3)

  console.log({
    r: r,
    g: g,
    b: b,
  })

  return toInt(toRange(r), toRange(g), toRange(b))
}

export default hslToRgb
