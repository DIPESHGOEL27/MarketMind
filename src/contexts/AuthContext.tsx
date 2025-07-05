import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase, User, UserProfile, UserSettings, validateKgpEmail, generateRollNumber } from '../lib/supabase'
import { AuthError, User as SupabaseUser, Session } from '@supabase/supabase-js'

interface AuthUser extends User {
  profile?: UserProfile
  settings?: UserSettings
  name?: string
  avatar?: string
  mobile?: string
  yearOfStudy?: string
  department?: string
  semester?: number
  rollNumber?: string
  bio?: string
  linkedinUrl?: string
  profileComplete?: boolean
  isFirstLogin?: boolean
}

interface SignupData {
  name: string
  mobile: string
  email: string
  password: string
  yearOfStudy: string
}

interface ProfileData {
  bio?: string
  avatar?: string
  linkedinUrl?: string
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string; needsVerification?: boolean }>
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  updateProfile: (data: ProfileData) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Temporarily bypass authentication with mock user data
  const BYPASS_AUTH = true; // Set to false to re-enable authentication

  useEffect(() => {
    if (BYPASS_AUTH) {
      // Set mock user data for demo purposes
      const mockUser: AuthUser = {
        id: 'mock-user-id',
        email: 'dipeshgoel@kgpian.iitkgp.ac.in',
        full_name: 'Dipesh Goel',
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
        is_active: true,
        email_verified: true,
        name: 'Dipesh Goel',
        department: 'Ocean and Naval Architecture',
        semester: 6,
        rollNumber: 'DIPESHGOEL',
        yearOfStudy: 'Third Year',
        profileComplete: true,
        isFirstLogin: false,
        bio: 'Ocean Engineering student passionate about marine technology and naval architecture.',
        mobile: '9876543210'
      };
      
      setUser(mockUser);
      setIsLoading(false);
      return;
    }

    // Original authentication logic below...
    let mounted = true
    let timeoutId: NodeJS.Timeout

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...')
        
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.warn('Auth initialization timeout')
            setIsLoading(false)
          }
        }, 10000)

        const { data: { session: initialSession }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          if (mounted) {
            setIsLoading(false)
          }
          return
        }

        if (initialSession?.user && mounted) {
          console.log('Found existing session for user:', initialSession.user.email)
          setSession(initialSession)
          
          try {
            const userData = await fetchUserData(initialSession.user)
            if (mounted) {
              setUser(userData)
            }
          } catch (fetchError) {
            console.error('Error fetching user data:', fetchError)
            if (mounted) {
              setUser({
                id: initialSession.user.id,
                email: initialSession.user.email!,
                full_name: initialSession.user.user_metadata?.full_name,
                created_at: initialSession.user.created_at,
                last_login: initialSession.user.last_sign_in_at,
                is_active: true,
                email_verified: !!initialSession.user.email_confirmed_at,
                name: initialSession.user.user_metadata?.full_name,
                department: 'Ocean and Naval Architecture',
                semester: 1,
                isFirstLogin: true
              })
            }
          }
        } else {
          console.log('No existing session found')
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
      }
    }

    if (!BYPASS_AUTH) {
      initializeAuth()

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.email)
          
          if (mounted) {
            setSession(session)
            
            if (session?.user) {
              try {
                const userData = await fetchUserData(session.user)
                setUser(userData)
              } catch (error) {
                console.error('Error fetching user data on auth change:', error)
                setUser({
                  id: session.user.id,
                  email: session.user.email!,
                  full_name: session.user.user_metadata?.full_name,
                  created_at: session.user.created_at,
                  last_login: session.user.last_sign_in_at,
                  is_active: true,
                  email_verified: !!session.user.email_confirmed_at,
                  name: session.user.user_metadata?.full_name,
                  department: 'Ocean and Naval Architecture',
                  semester: 1,
                  isFirstLogin: true
                })
              }
            } else {
              setUser(null)
            }
          }
        }
      )

      return () => {
        mounted = false
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        subscription.unsubscribe()
      }
    }
  }, [])

  // Fetch user profile and settings
  const fetchUserData = async (supabaseUser: SupabaseUser): Promise<AuthUser> => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError)
      }

      const { data: settings, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .single()

      if (settingsError && settingsError.code !== 'PGRST116') {
        console.error('Error fetching settings:', settingsError)
      }

      const authUser: AuthUser = {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        full_name: supabaseUser.user_metadata?.full_name,
        created_at: supabaseUser.created_at,
        last_login: supabaseUser.last_sign_in_at,
        is_active: true,
        email_verified: supabaseUser.email_confirmed_at ? true : false,
        profile,
        settings,
        name: supabaseUser.user_metadata?.full_name || profile?.user_id,
        avatar: profile?.avatar_url,
        mobile: profile?.mobile_number,
        yearOfStudy: profile?.year_of_study,
        department: profile?.department || 'Ocean and Naval Architecture',
        semester: profile?.semester || 1,
        rollNumber: profile?.roll_number,
        bio: profile?.bio,
        linkedinUrl: profile?.linkedin_url,
        profileComplete: profile?.profile_complete || false,
        isFirstLogin: profile?.is_first_login ?? true
      }

      return authUser
    } catch (error) {
      console.error('Error fetching user data:', error)
      throw error
    }
  }

  const signup = async (data: SignupData) => {
    try {
      if (!validateKgpEmail(data.email)) {
        return {
          success: false,
          error: 'Please use your official @kgpian.iitkgp.ac.in email address'
        }
      }

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email.toLowerCase(),
        password: data.password,
        options: {
          data: {
            full_name: data.name,
            mobile_number: data.mobile,
            year_of_study: data.yearOfStudy,
            roll_number: generateRollNumber(data.email)
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        console.error('Signup error:', error)
        return {
          success: false,
          error: error.message
        }
      }

      if (authData.user && !authData.user.email_confirmed_at) {
        return {
          success: true,
          needsVerification: true
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Signup error:', error)
      return {
        success: false,
        error: 'An unexpected error occurred during signup'
      }
    }
  }

  const login = async (email: string, password: string) => {
    try {
      if (!validateKgpEmail(email)) {
        return {
          success: false,
          error: 'Please use your official @kgpian.iitkgp.ac.in email address'
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password: password
      })

      if (error) {
        console.error('Login error:', error)
        
        if (error.message.includes('Invalid login credentials')) {
          return {
            success: false,
            error: 'Invalid email or password. If you don\'t have a user account, please sign up first, or if you\'re an admin, use the admin login page.'
          }
        } else if (error.message.includes('Email not confirmed')) {
          return {
            success: false,
            error: 'Please verify your email address before logging in. Check your inbox for the verification link.'
          }
        }
        
        return {
          success: false,
          error: error.message
        }
      }

      if (data.user) {
        try {
          await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', data.user.id)
        } catch (updateError) {
          console.error('Error updating last login:', updateError)
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        error: 'An unexpected error occurred during login'
      }
    }
  }

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Logout error:', error)
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const updateProfile = async (data: ProfileData) => {
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          bio: data.bio?.trim() || null,
          avatar_url: data.avatar || null,
          linkedin_url: data.linkedinUrl?.trim() || null,
          profile_complete: true,
          is_first_login: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (error) {
        console.error('Profile update error:', error)
        return {
          success: false,
          error: error.message
        }
      }

      if (session?.user) {
        const updatedUser = await fetchUserData(session.user)
        setUser(updatedUser)
      }

      return { success: true }
    } catch (error) {
      console.error('Profile update error:', error)
      return {
        success: false,
        error: 'An unexpected error occurred while updating profile'
      }
    }
  }

  const value = {
    user,
    isLoading,
    isAuthenticated: BYPASS_AUTH ? true : (!!session?.user && !!user?.email_verified),
    signup,
    login,
    logout,
    updateProfile
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}