import fs from 'fs'
import path from 'path'

export default function PreviewEmail() {
  const filePath = path.join(process.cwd(), 'supabase', 'templates', 'confirmation.html')
  let html = ''
  try {
    html = fs.readFileSync(filePath, 'utf-8')
    // Replace the Supabase variable with a realistic production URL
    html = html.replace(/\{\{ \.ConfirmationURL \}\}/g, 'https://gsav.vercel.app/auth/confirm?token=real-token-abc123')
  } catch (e) {
    html = '<h1>Template tidak ditemukan!</h1><p>Pastikan file supabase/templates/confirmation.html ada.</p>'
  }

  return (
    <div dangerouslySetInnerHTML={{ __html: html }} />
  )
}
