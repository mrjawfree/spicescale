import { generateQRDataURL, buildUTMUrl } from './qr'

const STORY_WIDTH = 1080
const STORY_HEIGHT = 1920
const MAX_RENDER_MS = 1500
const MAX_SIZE_BYTES = 500 * 1024

export interface StoryCardData {
  recipeTitle: string
  recipeSlug: string
  userId: string
  ingredients: Array<{ name: string; amount: number; unit: string }>
}

export interface StoryRenderResult {
  blob: Blob
  renderMs: number
  sizeBytes: number
}

export async function renderStoryCard(
  data: StoryCardData
): Promise<StoryRenderResult> {
  const start = performance.now()

  const canvas = new OffscreenCanvas(STORY_WIDTH, STORY_HEIGHT)
  const ctx = canvas.getContext('2d')!

  const gradient = ctx.createLinearGradient(0, 0, 0, STORY_HEIGHT)
  gradient.addColorStop(0, '#D4320C')
  gradient.addColorStop(1, '#8B1A06')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, STORY_WIDTH, STORY_HEIGHT)

  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 72px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('SpiceScale', STORY_WIDTH / 2, 200)

  ctx.font = 'bold 56px system-ui, sans-serif'
  const titleLines = wrapText(ctx, data.recipeTitle, STORY_WIDTH - 160)
  let y = 360
  for (const line of titleLines) {
    ctx.fillText(line, STORY_WIDTH / 2, y)
    y += 70
  }

  ctx.font = '36px system-ui, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  y += 40
  const maxIngredients = Math.min(data.ingredients.length, 8)
  for (let i = 0; i < maxIngredients; i++) {
    const ing = data.ingredients[i]
    ctx.fillText(`${ing.amount} ${ing.unit} ${ing.name}`, STORY_WIDTH / 2, y)
    y += 50
  }
  if (data.ingredients.length > 8) {
    ctx.fillText(`+${data.ingredients.length - 8} more...`, STORY_WIDTH / 2, y)
  }

  const utmUrl = buildUTMUrl(data.recipeSlug, data.userId)
  const qrDataUrl = generateQRDataURL(utmUrl, 280)
  const qrImg = await loadImage(qrDataUrl)
  const qrX = (STORY_WIDTH - 280) / 2
  const qrY = STORY_HEIGHT - 440

  ctx.fillStyle = '#FFFFFF'
  roundRect(ctx, qrX - 20, qrY - 20, 320, 320, 16)
  ctx.fill()
  ctx.drawImage(qrImg, qrX, qrY, 280, 280)

  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.font = '28px system-ui, sans-serif'
  ctx.fillText('Scan to cook this recipe', STORY_WIDTH / 2, STORY_HEIGHT - 100)

  let quality = 0.92
  let blob = await canvas.convertToBlob({ type: 'image/png' })

  if (blob.size > MAX_SIZE_BYTES) {
    blob = await canvas.convertToBlob({ type: 'image/jpeg', quality })
    while (blob.size > MAX_SIZE_BYTES && quality > 0.5) {
      quality -= 0.1
      blob = await canvas.convertToBlob({ type: 'image/jpeg', quality })
    }
  }

  const renderMs = performance.now() - start

  if (renderMs > MAX_RENDER_MS) {
    console.warn(`[StoryCard] Render exceeded SLO: ${renderMs.toFixed(0)}ms > ${MAX_RENDER_MS}ms`)
  }
  if (blob.size > MAX_SIZE_BYTES) {
    console.warn(`[StoryCard] Output exceeded size SLO: ${(blob.size / 1024).toFixed(0)}KB > ${MAX_SIZE_BYTES / 1024}KB`)
  }

  return { blob, renderMs, sizeBytes: blob.size }
}

function wrapText(ctx: OffscreenCanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}

function loadImage(src: string): Promise<ImageBitmap> {
  return fetch(src)
    .then((r) => r.blob())
    .then((b) => createImageBitmap(b))
}

function roundRect(
  ctx: OffscreenCanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}
