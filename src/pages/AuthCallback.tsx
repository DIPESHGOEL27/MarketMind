import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { BookOpen, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setStatus('error');
          setMessage('Email verification failed. Please try again.');
          setTimeout(() => navigate('/login?error=verification_failed'), 3000);
          return;
        }

        if (data.session?.user) {
          // Check if this is email verification
          if (data.session.user.email_confirmed_at) {
            setStatus('success');
            setMessage('Email verified successfully!');
            
            // Update user profile if metadata exists
            try {
              const metadata = data.session.user.user_metadata;
              if (metadata && (metadata.mobile_number || metadata.year_of_study || metadata.roll_number)) {
                await supabase
                  .from('user_profiles')
                  .update({
                    mobile_number: metadata.mobile_number,
                    year_of_study: metadata.year_of_study,
                    roll_number: metadata.roll_number,
                    is_first_login: true
                  })
                  .eq('user_id', data.session.user.id);
              }
            } catch (profileError) {
              console.error('Error updating profile after verification:', profileError);
            }
            
            // Redirect based on profile completion status
            setTimeout(() => {
              if (data.session?.user?.user_metadata?.full_name) {
                // Check if user needs profile enhancement
                navigate('/profile-enhancement');
              } else {
                navigate('/dashboard');
              }
            }, 2000);
          } else {
            // User session exists but email not verified
            setStatus('error');
            setMessage('Email verification pending. Please check your inbox.');
            setTimeout(() => navigate('/login'), 3000);
          }
        } else {
          // No session, might be a verification link click
          const accessToken = searchParams.get('access_token');
          const refreshToken = searchParams.get('refresh_token');
          
          if (accessToken && refreshToken) {
            // Set the session with the tokens
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            
            if (sessionError) {
              console.error('Session error:', sessionError);
              setStatus('error');
              setMessage('Invalid verification link. Please try again.');
              setTimeout(() => navigate('/login?error=invalid_link'), 3000);
            } else if (sessionData.session?.user?.email_confirmed_at) {
              setStatus('success');
              setMessage('Email verified successfully!');
              setTimeout(() => navigate('/dashboard'), 2000);
            } else {
              setStatus('error');
              setMessage('Verification incomplete. Please try again.');
              setTimeout(() => navigate('/login'), 3000);
            }
          } else {
            // No tokens or session
            setStatus('error');
            setMessage('Invalid verification link. Please try signing up again.');
            setTimeout(() => navigate('/signup'), 3000);
          }
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
        setTimeout(() => navigate('/login?error=unexpected'), 3000);
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <BookOpen className="h-12 w-12 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">VidyaSagar</h1>
          </div>
          
          {status === 'loading' && (
            <div>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-300">Verifying your email...</p>
            </div>
          )}
          
          {status === 'success' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
              <p className="text-gray-300">{message}</p>
              <p className="text-gray-400 text-sm mt-2">Redirecting you to complete your profile...</p>
            </motion.div>
          )}
          
          {status === 'error' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
              <p className="text-gray-300 mb-4">{message}</p>
              <p className="text-gray-400 text-sm">Redirecting you back...</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AuthCallback;