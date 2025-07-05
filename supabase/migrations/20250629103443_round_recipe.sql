/*
  # Complete Admin Features Migration

  1. Enhanced Resources Table
    - Add columns for Google Drive URLs, YouTube URLs, file metadata
    - Add content scheduling and analytics fields
    - Update constraints for new resource types

  2. Content Scheduling System
    - Table for scheduling publish/unpublish actions
    - Automated content management

  3. Resource Analytics
    - Detailed access tracking per user
    - Daily statistics aggregation

  4. Enhanced Categories
    - Hierarchical category support
    - Sort ordering capabilities

  5. Admin Analytics Functions
    - Comprehensive platform statistics
    - Resource performance metrics

  6. Security Policies
    - Row-level security for all new tables
    - Admin and user permission separation
*/

-- Enhanced resources table with all content types
DO $$
BEGIN
  -- Add new columns to resources table if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'google_drive_url') THEN
    ALTER TABLE resources ADD COLUMN google_drive_url text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'youtube_url') THEN
    ALTER TABLE resources ADD COLUMN youtube_url text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'youtube_playlist_id') THEN
    ALTER TABLE resources ADD COLUMN youtube_playlist_id varchar(100);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'file_size') THEN
    ALTER TABLE resources ADD COLUMN file_size bigint;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'file_format') THEN
    ALTER TABLE resources ADD COLUMN file_format varchar(20);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'duration') THEN
    ALTER TABLE resources ADD COLUMN duration integer; -- in minutes
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'pages') THEN
    ALTER TABLE resources ADD COLUMN pages integer;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'tags') THEN
    ALTER TABLE resources ADD COLUMN tags text[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'semester') THEN
    ALTER TABLE resources ADD COLUMN semester integer;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'course_code') THEN
    ALTER TABLE resources ADD COLUMN course_code varchar(20);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'is_published') THEN
    ALTER TABLE resources ADD COLUMN is_published boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'scheduled_publish_at') THEN
    ALTER TABLE resources ADD COLUMN scheduled_publish_at timestamptz;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'view_count') THEN
    ALTER TABLE resources ADD COLUMN view_count integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'download_count') THEN
    ALTER TABLE resources ADD COLUMN download_count integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'sort_order') THEN
    ALTER TABLE resources ADD COLUMN sort_order integer DEFAULT 0;
  END IF;
END $$;

-- Add constraints for resource validation
DO $$
BEGIN
  -- Add resource type constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'valid_resource_type' AND table_name = 'resources'
  ) THEN
    ALTER TABLE resources ADD CONSTRAINT valid_resource_type 
    CHECK (type IN ('pdf', 'video', 'notes', 'link'));
  END IF;
  
  -- Add semester validation constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'valid_semester' AND table_name = 'resources'
  ) THEN
    ALTER TABLE resources ADD CONSTRAINT valid_semester 
    CHECK (semester IS NULL OR (semester >= 1 AND semester <= 10));
  END IF;
END $$;

-- Content scheduling table
CREATE TABLE IF NOT EXISTS content_scheduling (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id uuid REFERENCES resources(id) ON DELETE CASCADE,
  scheduled_action varchar(50) NOT NULL CHECK (scheduled_action IN ('publish', 'unpublish', 'delete')),
  scheduled_at timestamptz NOT NULL,
  executed_at timestamptz,
  is_executed boolean DEFAULT false,
  created_by uuid REFERENCES admin_users(id),
  created_at timestamptz DEFAULT now()
);

-- Resource access statistics for detailed analytics
CREATE TABLE IF NOT EXISTS resource_access_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id uuid REFERENCES resources(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  access_type varchar(50) NOT NULL CHECK (access_type IN ('view', 'download', 'share')),
  access_date date DEFAULT CURRENT_DATE,
  access_count integer DEFAULT 1,
  last_accessed timestamptz DEFAULT now()
);

-- Unique constraint for daily stats per user per resource
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'resource_access_stats_resource_id_user_id_access_type_acces_key' 
    AND table_name = 'resource_access_stats'
  ) THEN
    ALTER TABLE resource_access_stats 
    ADD CONSTRAINT resource_access_stats_resource_id_user_id_access_type_acces_key 
    UNIQUE (resource_id, user_id, access_type, access_date);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_resources_published ON resources(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category_id);
CREATE INDEX IF NOT EXISTS idx_resources_semester ON resources(semester);
CREATE INDEX IF NOT EXISTS idx_resources_course ON resources(course_code);
CREATE INDEX IF NOT EXISTS idx_resources_created ON resources(created_at);

CREATE INDEX IF NOT EXISTS idx_content_scheduling_scheduled ON content_scheduling(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_content_scheduling_executed ON content_scheduling(is_executed);
CREATE INDEX IF NOT EXISTS idx_content_scheduling_resource ON content_scheduling(resource_id);

CREATE INDEX IF NOT EXISTS idx_resource_access_stats_resource ON resource_access_stats(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_access_stats_user ON resource_access_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_access_stats_date ON resource_access_stats(access_date);

-- Enhanced categories table with hierarchy support
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'parent_id') THEN
    ALTER TABLE categories ADD COLUMN parent_id uuid REFERENCES categories(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'sort_order') THEN
    ALTER TABLE categories ADD COLUMN sort_order integer DEFAULT 0;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories(sort_order);

-- Row Level Security Policies
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_scheduling ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_access_stats ENABLE ROW LEVEL SECURITY;

-- Policies for resources
DROP POLICY IF EXISTS "Admins can manage resources" ON resources;
CREATE POLICY "Admins can manage resources"
  ON resources FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() AND admin_users.is_active = true
    )
  );

DROP POLICY IF EXISTS "Users can view published resources" ON resources;
CREATE POLICY "Users can view published resources"
  ON resources FOR SELECT
  TO authenticated
  USING (is_published = true);

-- Policies for content scheduling
DROP POLICY IF EXISTS "Admins can manage content scheduling" ON content_scheduling;
CREATE POLICY "Admins can manage content scheduling"
  ON content_scheduling FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() AND admin_users.is_active = true
    )
  );

-- Policies for resource access stats
DROP POLICY IF EXISTS "Admins can view access stats" ON resource_access_stats;
CREATE POLICY "Admins can view access stats"
  ON resource_access_stats FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() AND admin_users.is_active = true
    )
  );

DROP POLICY IF EXISTS "Users can insert their own access stats" ON resource_access_stats;
CREATE POLICY "Users can insert their own access stats"
  ON resource_access_stats FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Function to get admin analytics
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
  WITH stats AS (
    SELECT 
      (SELECT count(*) FROM users WHERE is_active = true) as total_users,
      (SELECT count(*) FROM users WHERE last_login >= now() - (days_back || ' days')::interval) as active_users,
      (SELECT count(*) FROM resources) as total_resources,
      (SELECT count(*) FROM resources WHERE is_published = true) as published_resources,
      (SELECT coalesce(sum(view_count), 0) FROM resources) as total_views,
      (SELECT coalesce(sum(download_count), 0) FROM resources) as total_downloads,
      (SELECT count(*) FROM users WHERE created_at >= now() - (days_back || ' days')::interval) as recent_signups
  ),
  top_resources AS (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', r.id,
        'title', r.title,
        'type', r.type,
        'view_count', r.view_count,
        'download_count', r.download_count
      ) ORDER BY r.view_count DESC
    ) as most_viewed_resources
    FROM resources r 
    WHERE r.is_published = true 
    LIMIT 10
  )
  SELECT 
    s.total_users,
    s.active_users,
    s.total_resources,
    s.published_resources,
    s.total_views,
    s.total_downloads,
    s.recent_signups,
    tr.most_viewed_resources
  FROM stats s, top_resources tr;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;