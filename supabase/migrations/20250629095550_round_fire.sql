/*
  # User Management System for VidyaSagar Platform

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (varchar, unique, not null)
      - `password_hash` (varchar, not null)
      - `full_name` (varchar)
      - `created_at` (timestamptz, default now())
      - `last_login` (timestamptz)
      - `is_active` (boolean, default true)
      - `email_verified` (boolean, default false)
      - `verification_token` (varchar)
      - `reset_token` (varchar)
      - `reset_token_expires` (timestamptz)

    - `user_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `mobile_number` (varchar)
      - `year_of_study` (varchar)
      - `department` (varchar)
      - `semester` (integer)
      - `roll_number` (varchar)
      - `bio` (text)
      - `avatar_url` (text)
      - `linkedin_url` (text)
      - `profile_complete` (boolean, default false)
      - `is_first_login` (boolean, default true)
      - `updated_at` (timestamptz, default now())

    - `user_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `theme` (varchar, default 'dark')
      - `notifications_enabled` (boolean, default true)
      - `email_notifications` (boolean, default true)
      - `sms_notifications` (boolean, default false)
      - `language` (varchar, default 'en')
      - `timezone` (varchar, default 'Asia/Kolkata')
      - `updated_at` (timestamptz, default now())

    - `user_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `session_token` (varchar, unique, not null)
      - `ip_address` (inet)
      - `user_agent` (text)
      - `created_at` (timestamptz, default now())
      - `expires_at` (timestamptz, not null)
      - `is_active` (boolean, default true)

  2. Security
    - Enable RLS on all tables
    - Add authentication policies for users to access their own data
    - Add policies for profile management
    - Add policies for session management

  3. Indexes
    - Index on users.email for fast lookup
    - Index on users.created_at for sorting
    - Index on user_sessions.session_token for authentication
    - Index on user_sessions.expires_at for cleanup
    - Index on user_profiles.user_id for joins
    - Index on user_settings.user_id for joins
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(255) UNIQUE NOT NULL,
  password_hash varchar(255) NOT NULL,
  full_name varchar(255),
  created_at timestamptz DEFAULT now(),
  last_login timestamptz,
  is_active boolean DEFAULT true,
  email_verified boolean DEFAULT false,
  verification_token varchar(255),
  reset_token varchar(255),
  reset_token_expires timestamptz,
  
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT full_name_length CHECK (length(full_name) >= 2)
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mobile_number varchar(15),
  year_of_study varchar(50),
  department varchar(100) DEFAULT 'Ocean and Naval Architecture',
  semester integer DEFAULT 1,
  roll_number varchar(50),
  bio text,
  avatar_url text,
  linkedin_url text,
  profile_complete boolean DEFAULT false,
  is_first_login boolean DEFAULT true,
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT mobile_format CHECK (mobile_number ~* '^[0-9]{10}$'),
  CONSTRAINT semester_range CHECK (semester >= 1 AND semester <= 10),
  CONSTRAINT bio_length CHECK (length(bio) <= 500),
  CONSTRAINT linkedin_format CHECK (linkedin_url ~* '^https?://(www\.)?linkedin\.com/in/[a-zA-Z0-9-]+/?$')
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  theme varchar(20) DEFAULT 'dark',
  notifications_enabled boolean DEFAULT true,
  email_notifications boolean DEFAULT true,
  sms_notifications boolean DEFAULT false,
  language varchar(10) DEFAULT 'en',
  timezone varchar(50) DEFAULT 'Asia/Kolkata',
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_theme CHECK (theme IN ('light', 'dark', 'auto')),
  CONSTRAINT valid_language CHECK (language IN ('en', 'hi', 'bn'))
);

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token varchar(255) UNIQUE NOT NULL,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  
  CONSTRAINT future_expiry CHECK (expires_at > created_at)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token) WHERE verification_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token) WHERE reset_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_roll_number ON user_profiles(roll_number);
CREATE INDEX IF NOT EXISTS idx_user_profiles_department ON user_profiles(department);
CREATE INDEX IF NOT EXISTS idx_user_profiles_semester ON user_profiles(semester);

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active, expires_at) WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create policies for user_profiles table
CREATE POLICY "Users can view their own profile data"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile data"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile data"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for user_settings table
CREATE POLICY "Users can view their own settings"
  ON user_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for user_sessions table
CREATE POLICY "Users can view their own sessions"
  ON user_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON user_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON user_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON user_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create functions for automatic profile and settings creation
CREATE OR REPLACE FUNCTION create_user_profile_and_settings()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user profile
  INSERT INTO user_profiles (user_id, department, semester)
  VALUES (NEW.id, 'Ocean and Naval Architecture', 1);
  
  -- Create user settings
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile and settings
CREATE OR REPLACE TRIGGER create_user_profile_and_settings_trigger
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile_and_settings();

-- Create function to update profile updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE OR REPLACE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM user_sessions
  WHERE expires_at < now() OR is_active = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to generate verification token
CREATE OR REPLACE FUNCTION generate_verification_token()
RETURNS text AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to validate email domain
CREATE OR REPLACE FUNCTION validate_kgp_email(email_address text)
RETURNS boolean AS $$
BEGIN
  RETURN email_address ~* '^[A-Za-z0-9._%+-]+@kgpian\.iitkgp\.ac\.in$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add email domain validation constraint
ALTER TABLE users 
ADD CONSTRAINT valid_kgp_email 
CHECK (validate_kgp_email(email));

-- Create view for user data with profile information
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

-- Grant necessary permissions
GRANT SELECT ON user_data TO authenticated;