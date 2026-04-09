-- Таблица заказов
-- Выполнить в SQL Editor в Supabase Dashboard

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

-- Индексы для быстрых запросов
CREATE INDEX IF NOT EXISTS idx_orders_status        ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_city          ON orders (city);
CREATE INDEX IF NOT EXISTS idx_orders_total         ON orders (total_amount);
CREATE INDEX IF NOT EXISTS idx_orders_utm           ON orders (utm_source);
CREATE INDEX IF NOT EXISTS idx_orders_created_at    ON orders (created_at);
CREATE INDEX IF NOT EXISTS idx_orders_notified      ON orders (telegram_notified) WHERE telegram_notified = FALSE;

-- Разрешаем читать таблицу без авторизации (для дашборда)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read" ON orders
  FOR SELECT USING (true);

-- Только сервисный ключ может писать
CREATE POLICY "Allow service write" ON orders
  FOR ALL USING (auth.role() = 'service_role');
