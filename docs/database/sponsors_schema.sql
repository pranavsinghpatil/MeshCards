-- =============================================
-- MeshCards - Sponsors Table Schema
-- =============================================
-- This table tracks users who have sponsored the project
-- and grants them access to premium Novita AI models

-- Create sponsors table
CREATE TABLE IF NOT EXISTS sponsors (
    -- Primary key
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Foreign key to auth.users
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Sponsor details
    email TEXT NOT NULL,
    name TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true NOT NULL,
    
    -- Sponsor tier (for future expansion)
    -- supporter: Basic tier ($5/month)
    -- sponsor: Premium tier ($15/month)
    -- backer: Enterprise tier ($50/month)
    tier TEXT DEFAULT 'supporter' CHECK (tier IN ('supporter', 'sponsor', 'backer')),
    
    -- Buy Me a Coffee details (optional)
    coffee_email TEXT,
    coffee_name TEXT,
    coffee_supporter_id TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Constraints
    UNIQUE(user_id),
    UNIQUE(coffee_supporter_id)
);

-- =============================================
-- Indexes for Performance
-- =============================================

-- Index for fast user lookup
CREATE INDEX IF NOT EXISTS sponsors_user_id_idx ON sponsors(user_id);

-- Index for email search
CREATE INDEX IF NOT EXISTS sponsors_email_idx ON sponsors(email);

-- Index for active sponsors
CREATE INDEX IF NOT EXISTS sponsors_active_idx ON sponsors(is_active) WHERE is_active = true;

-- =============================================
-- Row Level Security (RLS) Policies
-- =============================================

-- Enable RLS
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own sponsor status
CREATE POLICY "Users can view their own sponsor status"
    ON sponsors
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Service role (backend) can manage all sponsors
CREATE POLICY "Service role can manage sponsors"
    ON sponsors
    FOR ALL
    USING (auth.role() = 'service_role');

-- =============================================
-- Functions & Triggers
-- =============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sponsors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Trigger to call the function on UPDATE
DROP TRIGGER IF EXISTS sponsors_updated_at_trigger ON sponsors;
CREATE TRIGGER sponsors_updated_at_trigger
    BEFORE UPDATE ON sponsors
    FOR EACH ROW
    EXECUTE FUNCTION update_sponsors_updated_at();

-- =============================================
-- Example Data (for testing)
-- =============================================

-- Insert a test sponsor (replace with real user_id after authentication)
-- INSERT INTO sponsors (user_id, email, name, is_active, tier)
-- VALUES (
--     '00000000-0000-0000-0000-000000000000', -- Replace with actual auth.users.id
--     'test@example.com',
--     'Test Sponsor',
--     true,
--     'supporter'
-- );

-- =============================================
-- Useful Queries
-- =============================================

-- View all active sponsors
-- SELECT * FROM sponsors WHERE is_active = true ORDER BY created_at DESC;

-- Check if a specific user is a sponsor
-- SELECT is_active, tier FROM sponsors WHERE user_id = 'your-user-uuid';

-- Count sponsors by tier
-- SELECT tier, COUNT(*) FROM sponsors WHERE is_active = true GROUP BY tier;

-- =============================================
-- Maintenance
-- =============================================

-- Remove inactive sponsors older than 1 year
-- DELETE FROM sponsors WHERE is_active = false AND updated_at < NOW() - INTERVAL '1 year';

COMMENT ON TABLE sponsors IS 'Tracks users who have sponsored the project and grants access to premium features';
COMMENT ON COLUMN sponsors.tier IS 'Sponsor tier: supporter ($5), sponsor ($15), backer ($50)';
COMMENT ON COLUMN sponsors.is_active IS 'Whether the sponsorship is currently active';
