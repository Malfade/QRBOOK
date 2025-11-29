import QRCode from 'qrcode'
import { mkdir } from 'fs/promises'
import { join } from 'path'

export async function generateQRCode(roomId: number): Promise<string> {
  const url = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/rooms/${roomId}`
  const qrPath = join(process.cwd(), 'public', 'qr', `${roomId}.png`)
  
  // Ensure directory exists
  await mkdir(join(process.cwd(), 'public', 'qr'), { recursive: true })
  
  // Generate QR code
  await QRCode.toFile(qrPath, url, {
    width: 400,
    margin: 2,
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
  })
  
  return `/qr/${roomId}.png`
}

export async function generateQRCodeBuffer(roomId: number): Promise<Buffer> {
  const url = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/rooms/${roomId}`
  
  return QRCode.toBuffer(url, {
    width: 400,
    margin: 2,
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
  })
}

