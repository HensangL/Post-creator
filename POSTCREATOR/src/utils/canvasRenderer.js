import { getTemplateById, outputFormats } from '../data/templates'

function roundedRect(context, x, y, width, height, radius) {
  context.beginPath()
  context.moveTo(x + radius, y)
  context.lineTo(x + width - radius, y)
  context.quadraticCurveTo(x + width, y, x + width, y + radius)
  context.lineTo(x + width, y + height - radius)
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  context.lineTo(x + radius, y + height)
  context.quadraticCurveTo(x, y + height, x, y + height - radius)
  context.lineTo(x, y + radius)
  context.quadraticCurveTo(x, y, x + radius, y)
  context.closePath()
}

function wrapText(context, text, maxWidth) {
  const words = text.split(/\s+/).filter(Boolean)
  const lines = []
  let line = ''

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word
    const width = context.measureText(testLine).width
    if (width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = testLine
    }
  }

  if (line) {
    lines.push(line)
  }

  return lines
}

export async function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Failed to load image'))
    image.src = url
  })
}

export async function renderDesignToCanvas(canvas, state, options = {}) {
  const format = outputFormats[state.outputFormat] ?? outputFormats.square
  const width = options.width ?? format.width
  const height = options.height ?? format.height
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Canvas is not available')
  }

  canvas.width = width
  canvas.height = height

  const template = getTemplateById(state.templateId)
  const style = template.style
  const design = state.design

  context.fillStyle = design.backgroundColor || style.background
  context.fillRect(0, 0, width, height)

  if (options.imageElement) {
    const image = options.imageElement
    const scaledW = width * design.imageScale
    const scaledH = (image.height / image.width) * scaledW
    context.drawImage(
      image,
      design.imageX,
      design.imageY,
      scaledW,
      scaledH,
    )
  }

  context.fillStyle = `rgba(0, 0, 0, ${design.overlayOpacity})`
  context.fillRect(0, height * 0.52, width, height * 0.48)

  context.fillStyle = design.accentColor || style.accent
  context.fillRect(0, 0, 14, height)

  if (state.form.isBreaking) {
    context.fillStyle = style.accent
    roundedRect(context, 40, 40, 260, 74, 10)
    context.fill()
    context.fillStyle = '#ffffff'
    context.font = 'bold 34px "Roboto Condensed", sans-serif'
    context.fillText('BREAKING', 58, 88)
  }

  context.fillStyle = design.textColor || style.headlineColor
  context.textAlign = design.textAlign
  context.font = `700 ${design.headlineSize}px "Roboto Condensed", sans-serif`

  const maxTextWidth = width - 140
  const headline = state.form.headline?.trim() || 'Add your headline here'
  const lines = wrapText(context, headline, maxTextWidth)
  const maxLines = 4
  const finalLines = lines.slice(0, maxLines)

  const anchorX =
    design.textAlign === 'center'
      ? width / 2
      : design.textAlign === 'right'
        ? width - 70
        : design.headlineX

  finalLines.forEach((line, index) => {
    const lineY = design.headlineY + index * design.headlineSize * design.lineHeight
    context.fillText(line, anchorX, lineY)
  })

  context.fillStyle = design.subheadlineColor || style.subheadlineColor
  context.textAlign = design.textAlign
  context.font = `500 ${design.subheadlineSize}px "Inter", sans-serif`
  const sub = state.form.subheadline?.trim() || 'Short description or subheadline'
  const subLines = wrapText(context, sub, maxTextWidth)
  const subAnchorY = design.headlineY + finalLines.length * design.headlineSize * design.lineHeight + 24
  subLines.slice(0, 2).forEach((line, index) => {
    context.fillText(line, anchorX, subAnchorY + index * (design.subheadlineSize + 6))
  })

  const footerText =
    `${state.form.location || 'Location'}  |  ${state.form.category || 'Category'}  |  ${state.form.reporter || state.form.source || 'Source'}`
  context.fillStyle = style.footerColor
  context.fillRect(0, height - 84, width, 84)
  context.fillStyle = style.footerTextColor
  context.font = '600 26px "Inter", sans-serif'
  context.textAlign = 'left'
  context.fillText(footerText, 40, height - 34)

  if (state.form.footerText) {
    context.textAlign = 'right'
    context.fillText(state.form.footerText, width - 40, height - 34)
  }

  if (options.logoElement) {
    context.save()
    context.globalAlpha = design.logoOpacity
    context.drawImage(options.logoElement, design.logoX, design.logoY, 160, 160)
    context.restore()
  }
}

export async function exportCanvasImage(state, options) {
  const canvas = document.createElement('canvas')
  await renderDesignToCanvas(canvas, state, options)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to produce image blob'))
          return
        }
        resolve(blob)
      },
      options.type === 'jpeg' ? 'image/jpeg' : 'image/png',
      0.92,
    )
  })
}
