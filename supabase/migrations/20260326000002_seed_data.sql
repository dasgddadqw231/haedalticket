-- =============================================
-- 시드 데이터: mockDb.ts SEED_RATES 기반
-- =============================================

INSERT INTO rates (key, label, value, color) VALUES
  ('culture', '컬쳐랜드', 90, '#F59E0B'),
  ('starbucks', '스타벅스', 90, '#10B981'),
  ('lotte', '롯데', 92, '#EF4444')
ON CONFLICT (key) DO NOTHING;
