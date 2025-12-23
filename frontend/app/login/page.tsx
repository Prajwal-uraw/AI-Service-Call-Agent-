'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, Mail, Lock, ArrowRight } from 'lucide-react';
import { setAuthToken } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setAuthToken('demo_token_' + Date.now(), email, 'admin');
      router.push('/dashboard');
    } catch (err) {
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('admin@kestrel.ai');
    setPassword('demo');
    setTimeout(() => {
      setAuthToken('demo_token_' + Date.now(), 'admin@kestrel.ai', 'admin');
      router.push('/dashboard');
    }, 300);
  };

  return (
    <div className="min-h-screen flex bg-neutral-50">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-neutral-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* Animated gradient orbs */}
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
          {/* Logo for mobile */}
          <div className="lg:hidden mb-8">
            <h1 className="text-2xl font-bold text-neutral-900">Kestrel VoiceOps</h1>
            <p className="text-neutral-600 text-sm mt-1">Sign in to your account</p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-lg p-8 shadow-sm">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-2">Welcome back</h2>
              <p className="text-sm text-neutral-600">Enter your credentials to access your dashboard</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
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
                    className="w-full pl-11 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="w-4 h-4 text-neutral-900 border-neutral-300 rounded focus:ring-neutral-900" />
                  <span className="ml-2 text-sm text-neutral-600">Remember me</span>
                </label>
                <a href="#" className="text-sm font-medium text-neutral-900 hover:text-neutral-700 transition-colors">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-neutral-900 text-white py-3 rounded-lg font-semibold hover:bg-neutral-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Sign in</span>
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

              <button
                onClick={handleDemoLogin}
                className="mt-4 w-full border-2 border-neutral-200 text-neutral-700 py-3 rounded-lg font-semibold hover:bg-neutral-50 transition-all"
              >
                Demo Account
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-neutral-600">
              Don't have an account?{' '}
              <a href="/calendar" className="font-medium text-neutral-900 hover:text-neutral-700 transition-colors">
                Get started
              </a>
            </p>
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
