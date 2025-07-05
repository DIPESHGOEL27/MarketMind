import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'vidyasagar-platform'
    }
  }
})

// Types for our database
export interface User {
  id: string
  email: string
  full_name?: string
  created_at: string
  last_login?: string
  is_active: boolean
  email_verified: boolean
}

export interface UserProfile {
  id: string
  user_id: string
  mobile_number?: string
  year_of_study?: string
  department: string
  semester: number
  roll_number?: string
  bio?: string
  avatar_url?: string
  linkedin_url?: string
  profile_complete: boolean
  is_first_login: boolean
  updated_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  theme: 'light' | 'dark' | 'auto'
  notifications_enabled: boolean
  email_notifications: boolean
  sms_notifications: boolean
  language: 'en' | 'hi' | 'bn'
  timezone: string
  updated_at: string
}

// Auth helper functions
export const validateKgpEmail = (email: string): boolean => {
  return /^[A-Za-z0-9._%+-]+@kgpian\.iitkgp\.ac\.in$/.test(email)
}

export const generateRollNumber = (email: string): string => {
  return email.split('@')[0].toUpperCase()
}