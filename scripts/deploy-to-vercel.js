/**
 * Деплоит проект на Vercel через REST API
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const TOKEN = process.env.VERCEL_TOKEN  // задай в .env: VERCEL_TOKEN=vck_...
const TEAM_ID = '' // без team — личный аккаунт

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
}

// Файлы которые нужно задеплоить
const INCLUDE = [
  'app/layout.tsx',
  'app/page.tsx',
  'app/globals.css',
  'components/DashboardCharts.tsx',
  'lib/data.ts',
  'lib/supabase.ts',
  'lib/types.ts',
  'next.config.js',
  'package.json',
  'tailwind.config.ts',
  'postcss.config.js',
  'tsconfig.json',
]

async function api(method, path, body) {
  const teamParam = TEAM_ID ? `?teamId=${TEAM_ID}` : ''
  const res = await fetch(`https://api.vercel.com${path}${teamParam}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  return res.json()
}

async function uploadFile(content) {
  const buf = Buffer.from(content)
  const sha = crypto.createHash('sha1').update(buf).digest('hex')

  const res = await fetch(`https://api.vercel.com/v2/files?teamId=${TEAM_ID}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/octet-stream',
      'x-vercel-digest': sha,
      'Content-Length': buf.length,
    },
    body: buf,
  })
  return sha
}

console.log('🚀 Деплой на Vercel через API...\n')

// Загружаем файлы
const files = []
for (const relPath of INCLUDE) {
  const fullPath = path.join(ROOT, relPath)
  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠️  Пропускаем (нет файла): ${relPath}`)
    continue
  }
  const content = fs.readFileSync(fullPath)
  const sha = await uploadFile(content)
  files.push({ file: relPath, sha })
  console.log(`  📤 ${relPath}`)
}

// Env vars для деплоя
const env = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://lfohqtomnyldtdttyozd.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
}

console.log('\n📦 Создаём деплой...')

const deployment = await api('POST', '/v13/deployments', {
  name: 'gbc-analytics-dashboard',
  files,
  framework: 'nextjs',
  buildCommand: 'npm run build',
  outputDirectory: '.next',
  env,
  projectSettings: { framework: 'nextjs' },
})

if (deployment.error) {
  console.error('❌ Ошибка деплоя:', deployment.error.message || JSON.stringify(deployment.error))
  process.exit(1)
}

const url = deployment.url || deployment.alias?.[0]
console.log('\n✅ Деплой создан!')
console.log('🔗 URL:', url ? `https://${url}` : 'проверь на vercel.com')
console.log('📊 ID:', deployment.id)
console.log('⏳ Статус:', deployment.readyState)
