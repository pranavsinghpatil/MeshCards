-- Migration to add atomic increment for user daily quota (preventing race condition)
CREATE OR REPLACE FUNCTION increment_daily_count(p_user_id UUID, p_today_ist TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE profiles
    SET 
        daily_count = CASE 
            WHEN last_reset != p_today_ist THEN 1
            ELSE daily_count + 1
        END,
        last_reset = p_today_ist
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
