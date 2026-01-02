-- =============================================
-- Bio Link Application - FINAL Supabase Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLE: profiles
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies: profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;

CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own profile"
ON profiles FOR DELETE
USING (auth.uid() = id);

-- =============================================
-- TABLE: links
-- =============================================
CREATE TABLE IF NOT EXISTS links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- Drop old policies (important)
DROP POLICY IF EXISTS "Active links are viewable by everyone" ON links;
DROP POLICY IF EXISTS "Users can view all their own links" ON links;
DROP POLICY IF EXISTS "Users can insert their own links" ON links;
DROP POLICY IF EXISTS "Users can update their own links" ON links;
DROP POLICY IF EXISTS "Users can delete their own links" ON links;

-- SELECT policy (SAFE)
CREATE POLICY "Public can view active links, owner can view all"
ON links FOR SELECT
USING (
  is_active = true
  OR auth.uid() = user_id
);

-- INSERT policy
CREATE POLICY "Users can insert their own links"
ON links FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE policy
CREATE POLICY "Users can update their own links"
ON links FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE policy
CREATE POLICY "Users can delete their own links"
ON links FOR DELETE
USING (auth.uid() = user_id);

-- =============================================
-- FUNCTION & TRIGGER: Auto-create profile on signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    LOWER(
      REPLACE(
        COALESCE(
          NEW.raw_user_meta_data->>'username',
          'user_' || SUBSTRING(NEW.id::text, 1, 8)
        ),
        ' ',
        '_'
      )
    ),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_profiles_username
ON profiles(username);

CREATE INDEX IF NOT EXISTS idx_links_user_id
ON links(user_id);

CREATE INDEX IF NOT EXISTS idx_links_sort_order
ON links(sort_order);
