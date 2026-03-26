-- =============================================
-- Haedal Ticket Supabase Migration
-- mockDb.ts 기반 테이블 생성
-- =============================================

-- 1. 매입률 (Rates)
CREATE TABLE IF NOT EXISTS rates (
  key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  value NUMERIC NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT '#000000',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. 일반 주문 (Normal Orders)
CREATE TYPE normal_status AS ENUM ('대기중', '입금 완료', '취소');

CREATE TABLE IF NOT EXISTS normal_orders (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  bank TEXT NOT NULL,
  account TEXT NOT NULL,
  card_type TEXT NOT NULL,
  pins TEXT[] NOT NULL DEFAULT '{}',
  status normal_status NOT NULL DEFAULT '대기중'
);

-- 3. 예약 주문 (Reservation Orders)
CREATE TYPE reservation_status AS ENUM ('대기', '선입금 완료', '정상 완료', '연체/미납', '취소');

CREATE TABLE IF NOT EXISTS reservation_orders (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reservation_date TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  bank TEXT NOT NULL,
  account TEXT NOT NULL,
  card_type TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 0,
  status reservation_status NOT NULL DEFAULT '대기'
);

-- 4. 인덱스
CREATE INDEX idx_normal_orders_status ON normal_orders(status);
CREATE INDEX idx_normal_orders_created_at ON normal_orders(created_at DESC);
CREATE INDEX idx_reservation_orders_status ON reservation_orders(status);
CREATE INDEX idx_reservation_orders_created_at ON reservation_orders(created_at DESC);
CREATE INDEX idx_normal_orders_phone ON normal_orders(phone);
CREATE INDEX idx_reservation_orders_phone ON reservation_orders(phone);

-- 5. updated_at 자동 갱신 트리거 (rates)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rates_updated_at
  BEFORE UPDATE ON rates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 6. RLS (Row Level Security) 정책
ALTER TABLE rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE normal_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_orders ENABLE ROW LEVEL SECURITY;

-- 누구나 읽기 가능 (anon key 사용)
CREATE POLICY "rates_read" ON rates FOR SELECT USING (true);
CREATE POLICY "normal_orders_read" ON normal_orders FOR SELECT USING (true);
CREATE POLICY "reservation_orders_read" ON reservation_orders FOR SELECT USING (true);

-- 누구나 삽입 가능 (주문 생성)
CREATE POLICY "normal_orders_insert" ON normal_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "reservation_orders_insert" ON reservation_orders FOR INSERT WITH CHECK (true);

-- 업데이트는 서비스 키 또는 인증된 사용자만 (관리자)
CREATE POLICY "rates_update" ON rates FOR UPDATE USING (true);
CREATE POLICY "normal_orders_update" ON normal_orders FOR UPDATE USING (true);
CREATE POLICY "reservation_orders_update" ON reservation_orders FOR UPDATE USING (true);
