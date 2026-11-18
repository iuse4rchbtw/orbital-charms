import fs from 'node:fs'

const envPath = '.env'
let env = fs.readFileSync(envPath, 'utf8')

const status = {}
const jsonPath = '/tmp/orbital-supabase-status.json'
const envStatusPath = '/tmp/orbital-supabase-status.env'

if (fs.existsSync(jsonPath)) {
  try {
    Object.assign(status, JSON.parse(fs.readFileSync(jsonPath, 'utf8')))
  } catch {}
}

if (fs.existsSync(envStatusPath) && fs.statSync(envStatusPath).size > 0) {
  for (const line of fs.readFileSync(envStatusPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (match) status[match[1]] = match[2].replace(/^"|"$/g, '')
  }
}

const get = (...keys) => {
  for (const key of keys) {
    const value = status[key]
    if (value) return String(value)
  }
  return ''
}

const dbUrl =
  get('DB_URL', 'db_url', 'DATABASE_URL') ||
  'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
const apiUrl = get('API_URL', 'api_url', 'SUPABASE_URL') || 'http://127.0.0.1:54321'
const s3Url =
  get('S3_URL', 's3_url') || 'http://127.0.0.1:54321/storage/v1/s3'
const s3AccessKey =
  get('S3_ACCESS_KEY', 'S3_ACCESS_KEY_ID', 's3_access_key') || ''
const s3SecretKey =
  get('S3_SECRET_KEY', 'S3_SECRET_ACCESS_KEY', 's3_secret_key') || ''
const anonKey =
  get('ANON_KEY', 'anon_key', 'PUBLISHABLE_KEY', 'publishable_key') || ''
const serviceRoleKey =
  get('SERVICE_ROLE_KEY', 'service_role_key', 'SECRET_KEY') || ''

let publicAppUrl = 'http://localhost:3000'
let publicSupabaseUrl = apiUrl
if (process.env.CODESPACE_NAME && process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN) {
  const domain = process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN
  publicAppUrl =
    `https://${process.env.CODESPACE_NAME}-3000.${domain}`
  publicSupabaseUrl =
    `https://${process.env.CODESPACE_NAME}-54321.${domain}`
}

const values = {
  DATABASE_URL: dbUrl,
  NEXT_PUBLIC_SERVER_URL: publicAppUrl,
  PAYLOAD_PUBLIC_SERVER_URL: publicAppUrl,
  SUPABASE_URL: publicSupabaseUrl,
  NEXT_PUBLIC_SUPABASE_URL: publicSupabaseUrl,
  SUPABASE_ANON_KEY: anonKey,
  SUPABASE_SERVICE_ROLE_KEY: serviceRoleKey,
  S3_ENDPOINT: s3Url,
  S3_REGION: get('S3_REGION', 'S3_REGION_NAME', 'region') || 'local',
  S3_BUCKET: 'payload-media',
  S3_ACCESS_KEY_ID: s3AccessKey,
  S3_SECRET_ACCESS_KEY: s3SecretKey,
}

for (const [key, value] of Object.entries(values)) {
  const escaped = String(value).replace(/\n/g, '')
  if (new RegExp(`^${key}=`, 'm').test(env)) {
    env = env.replace(new RegExp(`^${key}=.*$`, 'm'), `${key}=${escaped}`)
  } else {
    env += `\n${key}=${escaped}`
  }
}

fs.writeFileSync(envPath, env.trimEnd() + '\n')
