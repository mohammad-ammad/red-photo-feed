-- Add role column to profiles with default 'viewer'
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text DEFAULT 'viewer';

-- Optional constraint to restrict values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_role_check'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('viewer','creator'));
  END IF;
END$$;

-- Ensure existing rows have default
UPDATE public.profiles SET role = 'viewer' WHERE role IS NULL;
