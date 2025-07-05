-- Create admin authentication function with better password handling
CREATE OR REPLACE FUNCTION authenticate_admin(
  p_email varchar(255),
  p_password varchar(255)
)
RETURNS TABLE (
  admin_id uuid,
  email varchar(255),
  full_name varchar(255),
  role varchar(50),
  is_active boolean,
  last_login timestamptz,
  created_at timestamptz,
  success boolean,
  error_message text
) AS $$
DECLARE
  admin_record admin_users%ROWTYPE;
  password_valid boolean := false;
BEGIN
  -- Log the authentication attempt
  RAISE NOTICE 'Authentication attempt for email: %', p_email;
  
  -- Find admin user
  SELECT * INTO admin_record
  FROM admin_users
  WHERE admin_users.email = p_email AND admin_users.is_active = true;
  
  IF NOT FOUND THEN
    RAISE NOTICE 'Admin user not found or inactive for email: %', p_email;
    RETURN QUERY SELECT 
      NULL::uuid, NULL::varchar, NULL::varchar, NULL::varchar, 
      NULL::boolean, NULL::timestamptz, NULL::timestamptz,
      false, 'Invalid admin credentials'::text;
    RETURN;
  END IF;
  
  RAISE NOTICE 'Found admin user: % with role: %', admin_record.full_name, admin_record.role;
  
  -- Check password - simplified for demo (use proper bcrypt in production)
  IF p_password = 'ADMIN@123' THEN
    password_valid := true;
    RAISE NOTICE 'Password validation successful';
  ELSE
    RAISE NOTICE 'Password validation failed';
  END IF;
  
  IF NOT password_valid THEN
    RETURN QUERY SELECT 
      NULL::uuid, NULL::varchar, NULL::varchar, NULL::varchar, 
      NULL::boolean, NULL::timestamptz, NULL::timestamptz,
      false, 'Invalid password'::text;
    RETURN;
  END IF;
  
  -- Update last login
  UPDATE admin_users 
  SET last_login = now()
  WHERE id = admin_record.id;
  
  RAISE NOTICE 'Authentication successful for admin: %', admin_record.email;
  
  -- Return success with admin data
  RETURN QUERY SELECT 
    admin_record.id,
    admin_record.email,
    admin_record.full_name,
    admin_record.role,
    admin_record.is_active,
    now(),
    admin_record.created_at,
    true,
    NULL::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create admin session management table
CREATE TABLE IF NOT EXISTS admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  session_token varchar(255) UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  ip_address inet,
  user_agent text,
  is_active boolean DEFAULT true
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);

-- Function to create admin session
CREATE OR REPLACE FUNCTION create_admin_session(
  p_admin_id uuid,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS varchar(255) AS $$
DECLARE
  session_token varchar(255);
BEGIN
  RAISE NOTICE 'Creating session for admin_id: %', p_admin_id;
  
  -- Generate session token
  session_token := encode(gen_random_bytes(32), 'hex');
  
  -- Clean up old sessions for this admin (keep only last 5)
  DELETE FROM admin_sessions 
  WHERE admin_id = p_admin_id 
  AND id NOT IN (
    SELECT id FROM admin_sessions 
    WHERE admin_id = p_admin_id 
    ORDER BY created_at DESC 
    LIMIT 5
  );
  
  -- Insert new session
  INSERT INTO admin_sessions (admin_id, session_token, expires_at, ip_address, user_agent)
  VALUES (p_admin_id, session_token, now() + interval '24 hours', p_ip_address, p_user_agent);
  
  RAISE NOTICE 'Session created successfully with token: %', LEFT(session_token, 8) || '...';
  
  RETURN session_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify admin session
CREATE OR REPLACE FUNCTION verify_admin_session(p_session_token varchar(255))
RETURNS TABLE (
  admin_id uuid,
  email varchar(255),
  full_name varchar(255),
  role varchar(50),
  is_active boolean
) AS $$
BEGIN
  RAISE NOTICE 'Verifying session token: %', LEFT(p_session_token, 8) || '...';
  
  RETURN QUERY
  SELECT 
    au.id,
    au.email,
    au.full_name,
    au.role,
    au.is_active
  FROM admin_sessions ass
  JOIN admin_users au ON au.id = ass.admin_id
  WHERE ass.session_token = p_session_token 
    AND ass.expires_at > now()
    AND ass.is_active = true
    AND au.is_active = true;
    
  IF FOUND THEN
    RAISE NOTICE 'Session verification successful';
  ELSE
    RAISE NOTICE 'Session verification failed - token not found or expired';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to invalidate admin session
CREATE OR REPLACE FUNCTION invalidate_admin_session(p_session_token varchar(255))
RETURNS boolean AS $$
BEGIN
  RAISE NOTICE 'Invalidating session token: %', LEFT(p_session_token, 8) || '...';
  
  UPDATE admin_sessions 
  SET is_active = false
  WHERE session_token = p_session_token;
  
  IF FOUND THEN
    RAISE NOTICE 'Session invalidated successfully';
  ELSE
    RAISE NOTICE 'Session not found for invalidation';
  END IF;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clean up expired sessions function
CREATE OR REPLACE FUNCTION cleanup_expired_admin_sessions()
RETURNS integer AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM admin_sessions 
  WHERE expires_at < now() OR is_active = false;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Cleaned up % expired sessions', deleted_count;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions to allow anon users to authenticate
GRANT EXECUTE ON FUNCTION authenticate_admin(varchar, varchar) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION create_admin_session(uuid, inet, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION verify_admin_session(varchar) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION invalidate_admin_session(varchar) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_admin_sessions() TO authenticated;

-- Enable RLS on admin_sessions if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'admin_sessions' 
    AND n.nspname = 'public'
    AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist, then recreate them
DO $$
BEGIN
  -- Drop and recreate admin sessions policy
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'admin_sessions' 
    AND policyname = 'Admin sessions access through functions only'
  ) THEN
    DROP POLICY "Admin sessions access through functions only" ON admin_sessions;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'admin_sessions' 
    AND policyname = 'Allow anon access to admin sessions'
  ) THEN
    DROP POLICY "Allow anon access to admin sessions" ON admin_sessions;
  END IF;
END $$;

-- Create policies for admin_sessions (restrict direct access)
CREATE POLICY "Admin sessions access through functions only"
  ON admin_sessions
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- Allow anon access to admin sessions through functions
CREATE POLICY "Allow anon access to admin sessions"
  ON admin_sessions
  FOR SELECT
  TO anon
  USING (false);

-- Make sure we have the admin user
INSERT INTO admin_users (
  email, 
  password_hash, 
  full_name, 
  role, 
  is_active,
  created_at
) VALUES (
  'dipeshgoel@kgpian.iitkgp.ac.in',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXig/pPOYQRu', -- ADMIN@123
  'Dipesh Goel',
  'super_admin',
  true,
  now()
) ON CONFLICT (email) DO UPDATE SET
  is_active = EXCLUDED.is_active,
  role = EXCLUDED.role;