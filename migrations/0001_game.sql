CREATE TABLE IF NOT EXISTS rooms (
  code TEXT PRIMARY KEY,
  state TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 0,
  updated INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS rooms_updated ON rooms (updated);
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'approved'))
);
CREATE TABLE IF NOT EXISTS materials (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL
);
