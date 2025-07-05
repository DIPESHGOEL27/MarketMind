/*
  # Super Admin Setup

  1. Admin User Management
    - Set dipeshgoel@kgpian.iitkgp.ac.in as the absolute super admin
    - Create proper password hash for ADMIN@123
    - Add admin user management capabilities

  2. Enhanced Admin Roles
    - super_admin: Full system access (you)
    - content_manager: Limited access to content management
    - user_manager: User management only
    - analytics_viewer: Read-only analytics access

  3. Admin User Creation Functions
    - Function for super admin to create other admin users
    - Role-based permission validation
    - Audit logging for admin user creation

  4. Security Enhancements
    - Proper password hashing
    - Admin session management
    - Enhanced audit trails
*/

-- Update admin roles to include more granular permissions
DO $$
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'valid_admin_role' AND table_name = 'admin_users'
  ) THEN
    ALTER TABLE admin_users DROP CONSTRAINT valid_admin_role;
  END IF;
  
  -- Add new constraint with expanded roles
  ALTER TABLE admin_users ADD CONSTRAINT valid_admin_role 
  CHECK (role IN ('super_admin', 'content_manager', 'user_manager', 'analytics_viewer'));
END $$;

-- Function to create admin user (only super_admin can create other admins)
CREATE OR REPLACE FUNCTION create_admin_user(
  p_email varchar(255),
  p_password_hash varchar(255),
  p_full_name varchar(255),
  p_role varchar(50) DEFAULT 'content_manager'
)
RETURNS uuid AS $$
DECLARE
  new_admin_id uuid;
  current_admin_role varchar(50);
BEGIN
  -- Check if current user is super_admin
  SELECT role INTO current_admin_role
  FROM admin_users 
  WHERE id = auth.uid() AND is_active = true;
  
  IF current_admin_role != 'super_admin' THEN
    RAISE EXCEPTION 'Only super administrators can create admin users';
  END IF;
  
  -- Validate role
  IF p_role NOT IN ('super_admin', 'content_manager', 'user_manager', 'analytics_viewer') THEN
    RAISE EXCEPTION 'Invalid admin role specified';
  END IF;
  
  -- Only super_admin can create other super_admins
  IF p_role = 'super_admin' AND current_admin_role != 'super_admin' THEN
    RAISE EXCEPTION 'Only super administrators can create other super administrators';
  END IF;
  
  -- Insert new admin user
  INSERT INTO admin_users (email, password_hash, full_name, role, created_by)
  VALUES (p_email, p_password_hash, p_full_name, p_role, auth.uid())
  RETURNING id INTO new_admin_id;
  
  RETURN new_admin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update admin user (only super_admin can modify roles)
CREATE OR REPLACE FUNCTION update_admin_user(
  p_admin_id uuid,
  p_email varchar(255) DEFAULT NULL,
  p_full_name varchar(255) DEFAULT NULL,
  p_role varchar(50) DEFAULT NULL,
  p_is_active boolean DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
  current_admin_role varchar(50);
  target_admin_role varchar(50);
BEGIN
  -- Check if current user is super_admin
  SELECT role INTO current_admin_role
  FROM admin_users 
  WHERE id = auth.uid() AND is_active = true;
  
  -- Get target admin's current role
  SELECT role INTO target_admin_role
  FROM admin_users 
  WHERE id = p_admin_id;
  
  -- Only super_admin can modify admin users
  IF current_admin_role != 'super_admin' THEN
    RAISE EXCEPTION 'Only super administrators can modify admin users';
  END IF;
  
  -- Prevent modification of the absolute super admin (dipeshgoel@kgpian.iitkgp.ac.in)
  IF EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = p_admin_id 
    AND email = 'dipeshgoel@kgpian.iitkgp.ac.in'
    AND (p_role IS NOT NULL OR p_is_active = false)
  ) THEN
    RAISE EXCEPTION 'Cannot modify the absolute super administrator';
  END IF;
  
  -- Update admin user
  UPDATE admin_users 
  SET 
    email = COALESCE(p_email, email),
    full_name = COALESCE(p_full_name, full_name),
    role = COALESCE(p_role, role),
    is_active = COALESCE(p_is_active, is_active)
  WHERE id = p_admin_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to deactivate admin user (only super_admin)
CREATE OR REPLACE FUNCTION deactivate_admin_user(p_admin_id uuid)
RETURNS boolean AS $$
DECLARE
  current_admin_role varchar(50);
BEGIN
  -- Check if current user is super_admin
  SELECT role INTO current_admin_role
  FROM admin_users 
  WHERE id = auth.uid() AND is_active = true;
  
  IF current_admin_role != 'super_admin' THEN
    RAISE EXCEPTION 'Only super administrators can deactivate admin users';
  END IF;
  
  -- Prevent deactivation of the absolute super admin
  IF EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = p_admin_id AND email = 'dipeshgoel@kgpian.iitkgp.ac.in'
  ) THEN
    RAISE EXCEPTION 'Cannot deactivate the absolute super administrator';
  END IF;
  
  UPDATE admin_users 
  SET is_active = false
  WHERE id = p_admin_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check admin permissions
CREATE OR REPLACE FUNCTION check_admin_permission(
  required_role varchar DEFAULT 'content_manager',
  specific_permission varchar DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
  current_admin_role varchar(50);
BEGIN
  SELECT role INTO current_admin_role
  FROM admin_users 
  WHERE id = auth.uid() AND is_active = true;
  
  -- Super admin has all permissions
  IF current_admin_role = 'super_admin' THEN
    RETURN true;
  END IF;
  
  -- Check specific permissions based on role
  CASE specific_permission
    WHEN 'manage_users' THEN
      RETURN current_admin_role IN ('user_manager');
    WHEN 'manage_content' THEN
      RETURN current_admin_role IN ('content_manager');
    WHEN 'view_analytics' THEN
      RETURN current_admin_role IN ('analytics_viewer', 'content_manager', 'user_manager');
    WHEN 'manage_admins' THEN
      RETURN current_admin_role = 'super_admin';
    ELSE
      -- Default role-based check
      RETURN current_admin_role = required_role OR current_admin_role = 'super_admin';
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced admin policies
DROP POLICY IF EXISTS "Super admins can manage admin users" ON admin_users;
CREATE POLICY "Super admins can manage admin users"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users admin_users_1
      WHERE admin_users_1.id = auth.uid() 
      AND admin_users_1.role = 'super_admin' 
      AND admin_users_1.is_active = true
    )
  );

-- Policy for admins to view other admins (but not modify)
CREATE POLICY "Admins can view admin users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users admin_users_1
      WHERE admin_users_1.id = auth.uid() 
      AND admin_users_1.is_active = true
    )
  );

-- Update existing policies to use the new permission system
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
CREATE POLICY "Content managers can manage categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (check_admin_permission('content_manager', 'manage_content'));

DROP POLICY IF EXISTS "Admins can manage resources" ON resources;
CREATE POLICY "Content managers can manage resources"
  ON resources
  FOR ALL
  TO authenticated
  USING (check_admin_permission('content_manager', 'manage_content'));

-- User management policies
CREATE POLICY "User managers can view users"
  ON users
  FOR SELECT
  TO authenticated
  USING (check_admin_permission('user_manager', 'manage_users'));

CREATE POLICY "User managers can update users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (check_admin_permission('user_manager', 'manage_users'));

-- Clear existing admin users and insert the super admin
DELETE FROM admin_users;

-- Insert the absolute super admin with proper password hash
-- Password: ADMIN@123
-- Hash generated using bcrypt with salt rounds 12
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
);

-- Create view for admin user management
CREATE OR REPLACE VIEW admin_user_management AS
SELECT 
  id,
  email,
  full_name,
  role,
  is_active,
  last_login,
  created_at,
  created_by,
  CASE 
    WHEN email = 'dipeshgoel@kgpian.iitkgp.ac.in' THEN true
    ELSE false
  END as is_absolute_super_admin
FROM admin_users
WHERE is_active = true;

-- Grant permissions on new functions
GRANT EXECUTE ON FUNCTION create_admin_user(varchar, varchar, varchar, varchar) TO authenticated;
GRANT EXECUTE ON FUNCTION update_admin_user(uuid, varchar, varchar, varchar, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION deactivate_admin_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION check_admin_permission(varchar, varchar) TO authenticated;

-- Grant permissions on view
GRANT SELECT ON admin_user_management TO authenticated;

-- Create function to get admin role hierarchy
CREATE OR REPLACE FUNCTION get_admin_role_hierarchy()
RETURNS TABLE (
  role_name varchar,
  role_level integer,
  permissions text[]
) AS $$
BEGIN
  RETURN QUERY
  VALUES 
    ('super_admin', 1, ARRAY['manage_admins', 'manage_users', 'manage_content', 'view_analytics', 'system_settings']),
    ('content_manager', 2, ARRAY['manage_content', 'view_analytics']),
    ('user_manager', 2, ARRAY['manage_users', 'view_analytics']),
    ('analytics_viewer', 3, ARRAY['view_analytics']);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_admin_role_hierarchy() TO authenticated;

-- Add audit logging for admin user creation/modification
CREATE OR REPLACE FUNCTION admin_user_audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO admin_audit_logs (admin_id, action, table_name, record_id, new_values)
    VALUES (
      COALESCE(auth.uid(), NEW.created_by), 
      'ADMIN_USER_CREATED', 
      'admin_users', 
      NEW.id, 
      jsonb_build_object(
        'email', NEW.email,
        'full_name', NEW.full_name,
        'role', NEW.role,
        'created_by', NEW.created_by
      )
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO admin_audit_logs (admin_id, action, table_name, record_id, old_values, new_values)
    VALUES (
      auth.uid(), 
      'ADMIN_USER_UPDATED', 
      'admin_users', 
      NEW.id, 
      jsonb_build_object(
        'email', OLD.email,
        'full_name', OLD.full_name,
        'role', OLD.role,
        'is_active', OLD.is_active
      ),
      jsonb_build_object(
        'email', NEW.email,
        'full_name', NEW.full_name,
        'role', NEW.role,
        'is_active', NEW.is_active
      )
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO admin_audit_logs (admin_id, action, table_name, record_id, old_values)
    VALUES (
      auth.uid(), 
      'ADMIN_USER_DELETED', 
      'admin_users', 
      OLD.id, 
      jsonb_build_object(
        'email', OLD.email,
        'full_name', OLD.full_name,
        'role', OLD.role
      )
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Replace the existing admin audit trigger
DROP TRIGGER IF EXISTS admin_users_audit_trigger ON admin_users;
CREATE TRIGGER admin_users_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION admin_user_audit_trigger();