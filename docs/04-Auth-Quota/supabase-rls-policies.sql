-- Supabase RLS Policies for MeshCards
-- Run these in your Supabase SQL Editor

-- 1. Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Allow users to read their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 3. Allow users to insert their own profile (for first-time users)
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 4. Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 5. Allow service role full access (for backend operations)
CREATE POLICY "Service role full access"
ON profiles FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Note: Make sure you're using the SERVICE ROLE key in your backend .env file
-- not the ANON key, so the backend can bypass RLS when needed
