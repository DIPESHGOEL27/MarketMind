import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface AdminUser {
  id: string
  email: string
  full_name: string
  role: 'super_admin' | 'content_manager' | 'user_manager' | 'analytics_viewer'
  is_active: boolean
  last_login?: string
  created_at: string
}

interface AdminAuthContextType {
  adminUser: AdminUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  hasPermission: (requiredRole?: 'super_admin' | 'content_manager' | 'user_manager' | 'analytics_viewer') => boolean
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionToken, setSessionToken] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const checkAdminSession = async () => {
      try {
        // Check for stored session token
        const storedToken = localStorage.getItem('admin_session_token')
        if (!storedToken) {
          if (mounted) {
            setIsLoading(false)
          }
          return
        }

        console.log('Verifying stored admin session token...')

        // Verify the session token
        const { data, error } = await supabase.rpc('verify_admin_session', {
          p_session_token: storedToken
        })

        if (error) {
          console.error('Session verification error:', error)
          localStorage.removeItem('admin_session_token')
          if (mounted) {
            setAdminUser(null)
            setSessionToken(null)
            setIsLoading(false)
          }
          return
        }

        if (data && data.length > 0 && mounted) {
          const adminData = data[0]
          setAdminUser({
            id: adminData.admin_id,
            email: adminData.email,
            full_name: adminData.full_name,
            role: adminData.role,
            is_active: adminData.is_active,
            last_login: new Date().toISOString(),
            created_at: new Date().toISOString()
          })
          setSessionToken(storedToken)
          console.log('Admin session verified successfully')
        } else if (mounted) {
          localStorage.removeItem('admin_session_token')
          setAdminUser(null)
          setSessionToken(null)
        }
      } catch (error) {
        console.error('Error checking admin session:', error)
        localStorage.removeItem('admin_session_token')
        if (mounted) {
          setAdminUser(null)
          setSessionToken(null)
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    checkAdminSession()

    return () => {
      mounted = false
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      console.log('Starting admin authentication...')

      // Authenticate admin using the custom function
      const { data, error } = await supabase.rpc('authenticate_admin', {
        p_email: email.toLowerCase(),
        p_password: password
      })

      console.log('Authentication response:', { data, error })

      if (error) {
        console.error('Authentication error:', error);
        return {
          success: false,
          error: 'Authentication failed. Please check your credentials and try again.'
        }
      }

      if (!data || data.length === 0) {
        return {
          success: false,
          error: 'Invalid credentials'
        }
      }

      const authResult = data[0]
      console.log('Auth result:', authResult)
      
      if (!authResult.success) {
        return {
          success: false,
          error: authResult.error_message || 'Invalid credentials'
        }
      }

      console.log('Creating admin session...')

      // Create admin session
      const { data: sessionData, error: sessionError } = await supabase.rpc(
        'create_admin_session', 
        {
        p_admin_id: authResult.admin_id,
        p_ip_address: null,
        p_user_agent: navigator.userAgent
      })

      console.log('Session creation response:', { sessionData, sessionError })

      if (sessionError || !sessionData) {
        console.error('Session creation error:', sessionError)
        return {
          success: false,
          error: 'Failed to create session. Please try again.'
        }
      }

      // Store session token
      localStorage.setItem('admin_session_token', sessionData)
      setSessionToken(sessionData)

      // Set admin user
      const adminData: AdminUser = {
        id: authResult.admin_id,
        email: authResult.email,
        full_name: authResult.full_name,
        role: authResult.role,
        is_active: authResult.is_active,
        last_login: authResult.last_login,
        created_at: authResult.created_at
      }

      console.log('Admin login successful, user data set');
      setAdminUser(adminData)
      
      // Add a small delay to ensure the authentication state is properly updated
      await new Promise(resolve => setTimeout(resolve, 100));
      console.log('Admin login successful')

      return { success: true }
    } catch (error: any) {
      console.error('Admin login error:', error)
      
      return {
        success: false,
        error: 'An unexpected error occurred during login. Please try again.'
      }
    }
  }

  const logout = async () => {
    try {
      if (sessionToken) {
        console.log('Invalidating admin session...')
        // Invalidate session on server
        await supabase.rpc('invalidate_admin_session', {
          p_session_token: sessionToken
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear local session
      localStorage.removeItem('admin_session_token')
      setAdminUser(null)
      setSessionToken(null)
      console.log('Admin logout completed')
    }
  }

  const hasPermission = (requiredRole: 'super_admin' | 'content_manager' | 'user_manager' | 'analytics_viewer' = 'content_manager') => {
    if (!adminUser) return false
    if (adminUser.role === 'super_admin') return true
    return adminUser.role === requiredRole
  }

  const value = {
    adminUser,
    isLoading,
    isAuthenticated: !!adminUser && !!sessionToken,
    login,
    logout,
    hasPermission
  }

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}