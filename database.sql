-- Биологический возраст бот
-- Данный бот НЕ хранит персональные данные пользователей (по ТЗ).
-- Эта схема предназначена для опциональной аналитики (анонимной).

-- Анонимная статистика прохождений (опционально)
CREATE TABLE IF NOT EXISTS test_sessions (
  id SERIAL PRIMARY KEY,
  session_id UUID DEFAULT gen_random_uuid(),
  passport_age INTEGER NOT NULL CHECK (passport_age >= 16 AND passport_age <= 99),
  biological_age INTEGER NOT NULL,
  total_points INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индекс для аналитики по дате
CREATE INDEX idx_sessions_completed_at ON test_sessions(completed_at);

-- Примечание: telegram user_id НЕ сохраняется для защиты приватности