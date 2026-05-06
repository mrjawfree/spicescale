import qrcode from 'qrcode-generator'

export function generateQRDataURL(
  url: string,
  size: number = 200
): string {
  const qr = qrcode(0, 'M')
  qr.addData(url)
  qr.make()
  return qr.createDataURL(Math.max(1, Math.floor(size / qr.getModuleCount())))
}

export function buildUTMUrl(
  recipeSlug: string,
  userId: string,
  surface: string = 'story_card'
): string {
  const base = `${window.location.origin}${window.location.pathname}`
  const params = new URLSearchParams({
    utm_source: 'share',
    utm_medium: 'story',
    utm_campaign: 'spicescale_recipe',
    utm_content: recipeSlug,
    utm_term: surface,
    ref: userId,
  })
  return `${base}?${params.toString()}`
}
