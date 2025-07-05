/*
  # Enhanced Email Authentication System

  1. Email Validation
    - Enhanced KGP email validation function
    - Domain-specific validation for @kgpian.iitkgp.ac.in

  2. Profile Management
    - Enhanced profile creation with auth metadata
    - Automatic roll number generation
    - User settings initialization

  3. Security Enhancements
    - Email verification enforcement
    - Cleanup functions for unverified users
    - Proper indexing for performance

  4. Views and Permissions
    - Verified users view
    - Enhanced user data view
    - Appropriate access controls
*/

-- Update email validation function to be more specific
CREATE OR REPLACE FUNCTION validate_kgp_email(email_address text)
RETURNS boolean AS $$
BEGIN
  -- More specific validation for KGP email format
  RETURN email_address ~* '^[A-Za-z0-9][A-Za-z0-9._-]*[A-Za-z0-9]@kgpian\.iitkgp\.ac\.in$' 
    OR email_address ~* '^[A-Za-z0-9]@kgpian\.iitkgp\.ac\.in$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Enhanced profile creation function that handles auth metadata
CREATE OR REPLACE FUNCTION create_user_profile_and_settings()
RETURNS TRIGGER AS $$
DECLARE
  user_metadata jsonb;
BEGIN
  -- Get user metadata from auth.users if available
  SELECT raw_user_meta_data INTO user_metadata
  FROM auth.users 
  WHERE id = NEW.id;

  -- Create user profile with metadata if available
  INSERT INTO user_profiles (
    user_id, 
    mobile_number,
    year_of_study,
    roll_number,
    department, 
    semester,
    is_first_login
  ) VALUES (
    NEW.id,
    COALESCE(user_metadata->>'mobile_number', NULL),
    COALESCE(user_metadata->>'year_of_study', NULL),
    COALESCE(user_metadata->>'roll_number', 
      UPPER(SPLIT_PART(NEW.email, '@', 1))),
    'Ocean and Naval Architecture',
    1,
    true
  );
  
  -- Create user settings with defaults
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate roll number from email
CREATE OR REPLACE FUNCTION generate_roll_number(email_address text)
RETURNS text AS $$
BEGIN
  RETURN UPPER(SPLIT_PART(email_address, '@', 1));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add trigger to enforce email verification for new signups
CREATE OR REPLACE FUNCTION enforce_email_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- For new users, ensure email_confirmed_at is null initially
  -- This will be set by Supabase Auth when email is verified
  IF TG_OP = 'INSERT' AND NEW.email_confirmed_at IS NOT NULL THEN
    -- Allow if this is an admin operation or system operation
    IF current_setting('app.bypass_email_verification', true) = 'true' THEN
      RETURN NEW;
    END IF;
    
    -- For regular signups, email should not be pre-confirmed
    NEW.email_confirmed_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply the trigger to auth.users table (if accessible)
-- Note: This may not work in all Supabase setups due to auth schema restrictions
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'auth' AND table_name = 'users'
  ) THEN
    DROP TRIGGER IF EXISTS enforce_email_verification_trigger ON auth.users;
    CREATE TRIGGER enforce_email_verification_trigger
      BEFORE INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION enforce_email_verification();
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Ignore if we can't access auth.users table
  NULL;
END $$;

-- Add additional indexes for better performance (without subqueries)
CREATE INDEX IF NOT EXISTS idx_user_profiles_verification 
ON user_profiles(user_id, is_first_login);

CREATE INDEX IF NOT EXISTS idx_users_email_verified 
ON users(email_verified, is_active) 
WHERE email_verified = true;

CREATE INDEX IF NOT EXISTS idx_users_email_domain 
ON users(email) 
WHERE email LIKE '%@kgpian.iitkgp.ac.in';

-- Function to cleanup unverified users after a certain period
CREATE OR REPLACE FUNCTION cleanup_unverified_users(days_threshold integer DEFAULT 7)
RETURNS integer AS $$
DECLARE
  deleted_count integer;
BEGIN
  -- Delete users who haven't verified email after specified days
  WITH deleted AS (
    DELETE FROM users 
    WHERE email_verified = false 
      AND created_at < now() - (days_threshold || ' days')::interval
    RETURNING id
  )
  SELECT count(*) INTO deleted_count FROM deleted;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for verified users only
CREATE OR REPLACE VIEW verified_users AS
SELECT 
  u.*,
  p.mobile_number,
  p.year_of_study,
  p.department,
  p.semester,
  p.roll_number,
  p.profile_complete,
  p.is_first_login
FROM users u
LEFT JOIN user_profiles p ON u.id = p.user_id
WHERE u.email_verified = true AND u.is_active = true;

-- Grant appropriate permissions
GRANT SELECT ON verified_users TO authenticated;

-- Add email verification status to user_data view
DROP VIEW IF EXISTS user_data;
CREATE OR REPLACE VIEW user_data AS
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.created_at,
  u.last_login,
  u.is_active,
  u.email_verified,
  p.mobile_number,
  p.year_of_study,
  p.department,
  p.semester,
  p.roll_number,
  p.bio,
  p.avatar_url,
  p.linkedin_url,
  p.profile_complete,
  p.is_first_login,
  s.theme,
  s.notifications_enabled,
  s.email_notifications,
  s.language,
  s.timezone
FROM users u
LEFT JOIN user_profiles p ON u.id = p.user_id
LEFT JOIN user_settings s ON u.id = s.user_id;

-- Grant permissions
GRANT SELECT ON user_data TO authenticated;

-- Function to check if user email is verified
CREATE OR REPLACE FUNCTION is_email_verified(user_email text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE email = user_email 
      AND email_verified = true 
      AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark email as verified (for manual verification if needed)
CREATE OR REPLACE FUNCTION mark_email_verified(user_email text)
RETURNS boolean AS $$
BEGIN
  UPDATE users 
  SET email_verified = true,
      verification_token = NULL
  WHERE email = user_email;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get user profile with verification status
CREATE OR REPLACE FUNCTION get_user_profile(user_id uuid)
RETURNS TABLE (
  id uuid,
  email varchar,
  full_name varchar,
  email_verified boolean,
  mobile_number varchar,
  year_of_study varchar,
  department varchar,
  semester integer,
  roll_number varchar,
  bio text,
  avatar_url text,
  linkedin_url text,
  profile_complete boolean,
  is_first_login boolean,
  theme varchar,
  notifications_enabled boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.full_name,
    u.email_verified,
    p.mobile_number,
    p.year_of_study,
    p.department,
    p.semester,
    p.roll_number,
    p.bio,
    p.avatar_url,
    p.linkedin_url,
    p.profile_complete,
    p.is_first_login,
    s.theme,
    s.notifications_enabled
  FROM users u
  LEFT JOIN user_profiles p ON u.id = p.user_id
  LEFT JOIN user_settings s ON u.id = s.user_id
  WHERE u.id = get_user_profile.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION is_email_verified(text) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_email_verified(text) TO service_role;
GRANT EXECUTE ON FUNCTION get_user_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_unverified_users(integer) TO service_role;
GRANT EXECUTE ON FUNCTION generate_roll_number(text) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_kgp_email(text) TO authenticated;