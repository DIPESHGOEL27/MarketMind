/*
  # Admin System Database Schema

  1. New Tables
    - `admin_users` - Admin accounts with role-based access
    - `resources` - Content management (PDFs, videos, etc.)
    - `categories` - Content organization
    - `user_activity_logs` - Track user actions
    - `admin_audit_logs` - Track admin actions
    - `content_scheduling` - Scheduled content publishing

  2. Security
    - Enable RLS on all new tables
    - Add policies for admin access control
    - Create admin-specific functions

  3. Features
    - Role-based permissions
    - Content management system
    - User activity tracking
    - Analytics support
*/

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(255) UNIQUE NOT NULL,
  password_hash varchar(255) NOT NULL,
  full_name varchar(255) NOT NULL,
  role varchar(50) NOT NULL DEFAULT 'content_manager',
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES admin_users(id),
  
  CONSTRAINT valid_admin_role CHECK (role IN ('super_admin', 'content_manager')),
  CONSTRAINT admin_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL,
  slug varchar(100) UNIQUE NOT NULL,
  description text,
  parent_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES admin_users(id)
);

-- Create resources table
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(255) NOT NULL,
  description text,
  type varchar(50) NOT NULL,
  category_id uuid REFERENCES categories(id),
  file_url text,
  google_drive_url text,
  youtube_url text,
  youtube_playlist_id varchar(100),
  file_size bigint,
  file_format varchar(20),
  duration integer, -- for videos in seconds
  pages integer, -- for PDFs
  tags text[], -- array of tags
  semester integer,
  course_code varchar(20),
  is_published boolean DEFAULT false,
  scheduled_publish_at timestamptz,
  view_count integer DEFAULT 0,
  download_count integer DEFAULT 0,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES admin_users(id),
  
  CONSTRAINT valid_resource_type CHECK (type IN ('pdf', 'video', 'notes', 'link')),
  CONSTRAINT valid_semester CHECK (semester IS NULL OR (semester >= 1 AND semester <= 10))
);

-- Create user_activity_logs table
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  action varchar(100) NOT NULL,
  resource_id uuid REFERENCES resources(id) ON DELETE SET NULL,
  details jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Create admin_audit_logs table
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES admin_users(id),
  action varchar(100) NOT NULL,
  table_name varchar(100),
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Create content_scheduling table
CREATE TABLE IF NOT EXISTS content_scheduling (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id uuid REFERENCES resources(id) ON DELETE CASCADE,
  scheduled_action varchar(50) NOT NULL,
  scheduled_at timestamptz NOT NULL,
  executed_at timestamptz,
  is_executed boolean DEFAULT false,
  created_by uuid REFERENCES admin_users(id),
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_scheduled_action CHECK (scheduled_action IN ('publish', 'unpublish', 'delete'))
);

-- Create resource_access_stats table for analytics
CREATE TABLE IF NOT EXISTS resource_access_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id uuid REFERENCES resources(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  access_type varchar(50) NOT NULL,
  access_date date DEFAULT CURRENT_DATE,
  access_count integer DEFAULT 1,
  last_accessed timestamptz DEFAULT now(),
  
  CONSTRAINT valid_access_type CHECK (access_type IN ('view', 'download', 'share')),
  UNIQUE(resource_id, user_id, access_type, access_date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories(sort_order);

CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category_id);
CREATE INDEX IF NOT EXISTS idx_resources_published ON resources(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_resources_semester ON resources(semester);
CREATE INDEX IF NOT EXISTS idx_resources_course ON resources(course_code);
CREATE INDEX IF NOT EXISTS idx_resources_created ON resources(created_at);

CREATE INDEX IF NOT EXISTS idx_user_activity_user ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_resource ON user_activity_logs(resource_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_created ON user_activity_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_admin_audit_admin ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_table ON admin_audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_admin_audit_created ON admin_audit_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_content_scheduling_resource ON content_scheduling(resource_id);
CREATE INDEX IF NOT EXISTS idx_content_scheduling_scheduled ON content_scheduling(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_content_scheduling_executed ON content_scheduling(is_executed);

CREATE INDEX IF NOT EXISTS idx_resource_access_stats_resource ON resource_access_stats(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_access_stats_user ON resource_access_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_access_stats_date ON resource_access_stats(access_date);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_scheduling ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_access_stats ENABLE ROW LEVEL SECURITY;

-- Create admin policies
CREATE POLICY "Super admins can manage admin users"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND role = 'super_admin' AND is_active = true
    )
  );

CREATE POLICY "Admins can view categories"
  ON categories
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admins can manage categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can view published resources"
  ON resources
  FOR SELECT
  TO authenticated
  USING (is_published = true);

CREATE POLICY "Admins can manage resources"
  ON resources
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admins can view user activity logs"
  ON user_activity_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Super admins can view admin audit logs"
  ON admin_audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND role = 'super_admin' AND is_active = true
    )
  );

CREATE POLICY "Admins can manage content scheduling"
  ON content_scheduling
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can insert their own access stats"
  ON resource_access_stats
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view access stats"
  ON resource_access_stats
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- Create triggers for updated_at
CREATE OR REPLACE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create admin audit trigger function
CREATE OR REPLACE FUNCTION admin_audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO admin_audit_logs (admin_id, action, table_name, record_id, new_values)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO admin_audit_logs (admin_id, action, table_name, record_id, old_values, new_values)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO admin_audit_logs (admin_id, action, table_name, record_id, old_values)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers for admin actions
CREATE OR REPLACE TRIGGER admin_users_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION admin_audit_trigger();

CREATE OR REPLACE TRIGGER resources_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON resources
  FOR EACH ROW EXECUTE FUNCTION admin_audit_trigger();

CREATE OR REPLACE TRIGGER categories_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON categories
  FOR EACH ROW EXECUTE FUNCTION admin_audit_trigger();

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
  p_user_id uuid,
  p_action varchar,
  p_resource_id uuid DEFAULT NULL,
  p_details jsonb DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO user_activity_logs (user_id, action, resource_id, details)
  VALUES (p_user_id, p_action, p_resource_id, p_details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track resource access
CREATE OR REPLACE FUNCTION track_resource_access(
  p_resource_id uuid,
  p_user_id uuid,
  p_access_type varchar
)
RETURNS void AS $$
BEGIN
  INSERT INTO resource_access_stats (resource_id, user_id, access_type)
  VALUES (p_resource_id, p_user_id, p_access_type)
  ON CONFLICT (resource_id, user_id, access_type, access_date)
  DO UPDATE SET 
    access_count = resource_access_stats.access_count + 1,
    last_accessed = now();

  -- Update counters on resources table
  IF p_access_type = 'view' THEN
    UPDATE resources SET view_count = view_count + 1 WHERE id = p_resource_id;
  ELSIF p_access_type = 'download' THEN
    UPDATE resources SET download_count = download_count + 1 WHERE id = p_resource_id;
  END IF;

  -- Log the activity
  PERFORM log_user_activity(p_user_id, 'resource_' || p_access_type, p_resource_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get analytics data
CREATE OR REPLACE FUNCTION get_admin_analytics(days_back integer DEFAULT 30)
RETURNS TABLE (
  total_users bigint,
  active_users bigint,
  total_resources bigint,
  published_resources bigint,
  total_views bigint,
  total_downloads bigint,
  recent_signups bigint,
  most_viewed_resources jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT count(*) FROM users WHERE is_active = true),
    (SELECT count(DISTINCT user_id) FROM user_activity_logs 
     WHERE created_at >= now() - (days_back || ' days')::interval),
    (SELECT count(*) FROM resources),
    (SELECT count(*) FROM resources WHERE is_published = true),
    (SELECT COALESCE(sum(view_count), 0) FROM resources),
    (SELECT COALESCE(sum(download_count), 0) FROM resources),
    (SELECT count(*) FROM users 
     WHERE created_at >= now() - (days_back || ' days')::interval),
    (SELECT jsonb_agg(
       jsonb_build_object(
         'id', r.id,
         'title', r.title,
         'view_count', r.view_count,
         'type', r.type
       )
     ) FROM (
       SELECT id, title, view_count, type 
       FROM resources 
       WHERE is_published = true 
       ORDER BY view_count DESC 
       LIMIT 10
     ) r);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check admin permissions
CREATE OR REPLACE FUNCTION check_admin_permission(required_role varchar DEFAULT 'content_manager')
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid() 
      AND is_active = true 
      AND (role = required_role OR role = 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default super admin (update with your actual admin credentials)
INSERT INTO admin_users (email, password_hash, full_name, role, is_active)
VALUES (
  'admin@example.com',
  '$2b$10$example_hash', -- Replace with actual hashed password
  'System Administrator',
  'super_admin',
  true
) ON CONFLICT (email) DO NOTHING;

-- Insert default categories
INSERT INTO categories (name, slug, description, sort_order) VALUES
  ('Ocean Engineering', 'ocean-engineering', 'Ocean and marine engineering resources', 1),
  ('Naval Architecture', 'naval-architecture', 'Ship design and naval architecture', 2),
  ('Marine Structures', 'marine-structures', 'Offshore and marine structures', 3),
  ('Hydrodynamics', 'hydrodynamics', 'Fluid mechanics and hydrodynamics', 4),
  ('General', 'general', 'General academic resources', 99)
ON CONFLICT (slug) DO NOTHING;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON admin_users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON resources TO authenticated;
GRANT SELECT, INSERT ON user_activity_logs TO authenticated;
GRANT SELECT ON admin_audit_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON content_scheduling TO authenticated;
GRANT SELECT, INSERT, UPDATE ON resource_access_stats TO authenticated;

GRANT EXECUTE ON FUNCTION log_user_activity(uuid, varchar, uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION track_resource_access(uuid, uuid, varchar) TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_analytics(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION check_admin_permission(varchar) TO authenticated;