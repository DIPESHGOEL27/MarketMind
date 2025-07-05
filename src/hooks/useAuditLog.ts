import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAdminAuth } from '../contexts/AdminAuthContext';

export interface AuditLogEntry {
  action: string;
  table_name?: string;
  record_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

export const useAuditLog = () => {
  const { adminUser } = useAdminAuth();

  const logAction = useCallback(async (entry: AuditLogEntry) => {
    if (!adminUser) {
      console.warn('No admin user found for audit log');
      return;
    }

    try {
      // Get client IP and user agent
      const userAgent = navigator.userAgent;
      
      // In a real application, you'd get the actual IP from your backend
      // For now, we'll use a placeholder
      const ipAddress = '127.0.0.1'; // This should come from your backend

      const auditData = {
        admin_id: adminUser.id,
        action: entry.action,
        table_name: entry.table_name || null,
        record_id: entry.record_id || null,
        old_values: entry.old_values || null,
        new_values: entry.new_values || null,
        ip_address: ipAddress,
        user_agent: userAgent,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('admin_audit_logs')
        .insert([auditData]);

      if (error) {
        console.error('Failed to log audit entry:', error);
      }
    } catch (error) {
      console.error('Error logging audit entry:', error);
    }
  }, [adminUser]);

  // Specific logging functions for common actions
  const logLogin = useCallback(() => {
    logAction({
      action: 'admin_login'
    });
  }, [logAction]);

  const logLogout = useCallback(() => {
    logAction({
      action: 'admin_logout'
    });
  }, [logAction]);

  const logResourceCreate = useCallback((resourceId: string, resourceData: Record<string, any>) => {
    logAction({
      action: 'resource_create',
      table_name: 'resources',
      record_id: resourceId,
      new_values: resourceData
    });
  }, [logAction]);

  const logResourceUpdate = useCallback((
    resourceId: string, 
    oldData: Record<string, any>, 
    newData: Record<string, any>
  ) => {
    logAction({
      action: 'resource_update',
      table_name: 'resources',
      record_id: resourceId,
      old_values: oldData,
      new_values: newData
    });
  }, [logAction]);

  const logResourceDelete = useCallback((resourceId: string, resourceData: Record<string, any>) => {
    logAction({
      action: 'resource_delete',
      table_name: 'resources',
      record_id: resourceId,
      old_values: resourceData
    });
  }, [logAction]);

  const logUserUpdate = useCallback((
    userId: string, 
    oldData: Record<string, any>, 
    newData: Record<string, any>
  ) => {
    logAction({
      action: 'user_update',
      table_name: 'users',
      record_id: userId,
      old_values: oldData,
      new_values: newData
    });
  }, [logAction]);

  const logAccessAttempt = useCallback((action: string, details?: Record<string, any>) => {
    logAction({
      action: `access_attempt_${action}`,
      new_values: details
    });
  }, [logAction]);

  const logSystemChange = useCallback((setting: string, oldValue: any, newValue: any) => {
    logAction({
      action: 'system_settings_change',
      table_name: 'system_settings',
      old_values: { [setting]: oldValue },
      new_values: { [setting]: newValue }
    });
  }, [logAction]);

  return {
    logAction,
    logLogin,
    logLogout,
    logResourceCreate,
    logResourceUpdate,
    logResourceDelete,
    logUserUpdate,
    logAccessAttempt,
    logSystemChange
  };
};

export default useAuditLog;