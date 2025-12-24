'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, Mail, Lock, ArrowRight, Github } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { setAuthToken } from '@/lib/auth';

// Force dynamic rendering to avoid build-time Supabase client creation
export const dynamic = 'force-dynamic';

export default function LoginPageWithSupabase() {
  const router = useRouter();
  const supabase = createClient();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  const handleSupabaseAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) throw error;

        if (data.user) {
          setError('Check your email for the confirmation link!');
          setTimeout(() => {
            setMode('signin');
            setError('');
          }, 3000);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.session) {
          // Store in localStorage for compatibility with existing auth
          setAuthToken(data.session.access_token, email, 'user');
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'OAuth login failed');
    }
  };

  const handleDemoLogin = () => {
    setAuthToken('demo_token_' + Date.now(), 'admin@kestrel.ai', 'admin');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex bg-neutral-50">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-neutral-900 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-float-delayed"></div>
        
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-2">Kestrel VoiceOps</h1>
          <p className="text-neutral-400 text-lg">AI Voice Agent Platform</p>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Never miss a call. Never lose revenue.
            </h2>
            <p className="text-neutral-400 leading-relaxed">
              AI voice agents that answer every call, book appointments instantly, and follow up automatically.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
              <div className="text-3xl font-bold text-white mb-1">500+</div>
              <div className="text-sm text-neutral-400">Active Businesses</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
              <div className="text-3xl font-bold text-white mb-1">98%</div>
              <div className="text-sm text-neutral-400">Answer Rate</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-neutral-500">
          © 2024 Kestrel VoiceOps. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <h1 className="text-2xl font-bold text-neutral-900">Kestrel VoiceOps</h1>
            <p className="text-neutral-600 text-sm mt-1">
              {mode === 'signin' ? 'Sign in to your account' : 'Create your account'}
            </p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-lg p-8 shadow-sm">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
                {mode === 'signin' ? 'Welcome back' : 'Get started'}
              </h2>
              <p className="text-sm text-neutral-600">
                {mode === 'signin' 
                  ? 'Enter your credentials to access your dashboard'
                  : 'Create an account to start using Kestrel'}
              </p>
            </div>

            {error && (
              <div className={`mb-6 p-4 rounded-lg ${
                error.includes('Check your email') 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <p className={`text-sm ${
                  error.includes('Check your email') ? 'text-green-800' : 'text-red-800'
                }`}>
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSupabaseAuth} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    className="w-full pl-11 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pl-11 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                  />
                </div>
                {mode === 'signup' && (
                  <p className="text-xs text-neutral-500 mt-1">Must be at least 6 characters</p>
                )}
              </div>

              {mode === 'signin' && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" className="w-4 h-4 text-neutral-900 border-neutral-300 rounded focus:ring-neutral-900" />
                    <span className="ml-2 text-sm text-neutral-600">Remember me</span>
                  </label>
                  <a href="#" className="text-sm font-medium text-neutral-900 hover:text-neutral-700 transition-colors">
                    Forgot password?
                  </a>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-neutral-900 text-white py-3 rounded-lg font-semibold hover:bg-neutral-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>{mode === 'signin' ? 'Signing in...' : 'Creating account...'}</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>{mode === 'signin' ? 'Sign in' : 'Sign up'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-neutral-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleOAuthLogin('google')}
                  className="flex items-center justify-center gap-2 border-2 border-neutral-200 text-neutral-700 py-2.5 rounded-lg font-medium hover:bg-neutral-50 transition-all"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Google</span>
                </button>
                
                <button
                  onClick={() => handleOAuthLogin('github')}
                  className="flex items-center justify-center gap-2 border-2 border-neutral-200 text-neutral-700 py-2.5 rounded-lg font-medium hover:bg-neutral-50 transition-all"
                >
                  <Github className="w-5 h-5" />
                  <span>GitHub</span>
                </button>
              </div>

              <button
                onClick={handleDemoLogin}
                className="mt-3 w-full border-2 border-blue-200 bg-blue-50 text-blue-700 py-2.5 rounded-lg font-semibold hover:bg-blue-100 transition-all"
              >
                🎭 Demo Account (Quick Access)
              </button>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                className="text-sm text-neutral-600"
              >
                {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
                <span className="font-medium text-neutral-900 hover:text-neutral-700 transition-colors">
                  {mode === 'signin' ? 'Sign up' : 'Sign in'}
                </span>
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-neutral-500">
            By signing in, you agree to our{' '}
            <a href="#" className="underline hover:text-neutral-700">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="underline hover:text-neutral-700">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
