-- Add location, people_present, rating, and views columns to posts table
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS people_present text,
ADD COLUMN IF NOT EXISTS rating integer CHECK (rating >= 1 AND rating <= 5),
ADD COLUMN IF NOT EXISTS views integer DEFAULT 0;
