-- Add location, people_present, and rating columns to posts table
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS people_present text,
ADD COLUMN IF NOT EXISTS rating integer CHECK (rating >= 1 AND rating <= 5);
