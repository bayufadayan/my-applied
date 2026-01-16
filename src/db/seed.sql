-- Seed platforms data
INSERT INTO platforms (name, icon) VALUES
  ('LinkedIn', NULL),
  ('JobStreet', NULL),
  ('Glints', NULL),
  ('Kalibrr', NULL),
  ('Indeed', NULL),
  ('Instagram', NULL),
  ('Twitter/X', NULL),
  ('Facebook', NULL),
  ('Telegram', NULL),
  ('WhatsApp', NULL),
  ('Email Langsung', NULL),
  ('Website Perusahaan', NULL),
  ('Referral', NULL),
  ('Job Fair', NULL),
  ('Lainnya', NULL)
ON CONFLICT (name) DO NOTHING;
