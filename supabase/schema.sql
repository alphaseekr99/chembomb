-- Apply in the Supabase SQL editor. Only the backend service role may access these tables.
CREATE TABLE IF NOT EXISTS public.rooms (
  code text PRIMARY KEY, state text NOT NULL, version integer NOT NULL DEFAULT 0, updated bigint NOT NULL
);
CREATE INDEX IF NOT EXISTS rooms_updated ON public.rooms (updated);
CREATE TABLE IF NOT EXISTS public.questions (
  id text PRIMARY KEY, data text NOT NULL, status text NOT NULL CHECK (status IN ('draft', 'approved'))
);
CREATE TABLE IF NOT EXISTS public.materials (id text PRIMARY KEY, data text NOT NULL);
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.rooms, public.questions, public.materials FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rooms, public.questions, public.materials TO service_role;
