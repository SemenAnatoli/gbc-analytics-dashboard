/**
 * Создаёт таблицу orders в Supabase через REST API
 */
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Проверяем подключение
const { data, error } = await supabase.from('orders').select('id').limit(1)

if (!error) {
  console.log('✅ Таблица orders уже существует!')
  process.exit(0)
}

if (error.code === '42P01') {
  console.log('📋 Таблица не найдена — создаём через SQL...')

  // Создаём через Supabase REST API (SQL через rpc)
  const { error: sqlError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS orders (
        id                   SERIAL PRIMARY KEY,
        retailcrm_id         INTEGER UNIQUE,
        first_name           TEXT NOT NULL DEFAULT '',
        last_name            TEXT NOT NULL DEFAULT '',
        phone                TEXT,
        email                TEXT,
        status               TEXT NOT NULL DEFAULT 'new',
        total_amount         NUMERIC(12, 2) NOT NULL DEFAULT 0,
        city                 TEXT,
        utm_source           TEXT,
        items                JSONB DEFAULT '[]',
        retailcrm_created_at TIMESTAMPTZ,
        telegram_notified    BOOLEAN NOT NULL DEFAULT FALSE,
        created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `
  })

  if (sqlError) {
    console.error('❌ Ошибка создания таблицы:', sqlError.message)
    console.log('\n⚠️  Нужно создать таблицу вручную в Supabase Dashboard:')
    console.log('   1. Открой: https://supabase.com/dashboard/project/lfohqtomnyldtdttyozd/sql/new')
    console.log('   2. Вставь SQL из файла: supabase/schema.sql')
    console.log('   3. Нажми "Run"')
  } else {
    console.log('✅ Таблица создана!')
  }
} else {
  console.error('❌ Ошибка подключения:', error.message)
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 30) + '...')
}
