-- Enable necessary extensions and create profiles table for Supabase auth users
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles table links to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);
