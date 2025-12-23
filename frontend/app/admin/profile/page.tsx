'use client';

import AdminShell from '@/components/AdminShell';
import { User, Mail, Phone, Shield, Key } from 'lucide-react';

export default function ProfilePage() {
  return (
    <AdminShell>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Profile Settings</h1>
          <p className="text-slate-400 mt-2">Manage your account information</p>
        </div>

        <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-slate-100 mb-6">Personal Information</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="profile-full-name" className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>
              <div className="flex items-center gap-3 bg-slate-900/30 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3">
                <User className="w-5 h-5 text-slate-400" />
                <input
                  id="profile-full-name"
                  type="text"
                  defaultValue="Admin User"
                  className="flex-1 bg-transparent text-slate-100 outline-none"
                />
              </div>
            </div>
            <div>
              <label htmlFor="profile-email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <div className="flex items-center gap-3 bg-slate-900/30 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3">
                <Mail className="w-5 h-5 text-slate-400" />
                <input
                  id="profile-email"
                  type="email"
                  defaultValue="admin@kestrel.ai"
                  className="flex-1 bg-transparent text-slate-100 outline-none"
                />
              </div>
            </div>
            <div>
              <label htmlFor="profile-phone" className="block text-sm font-medium text-slate-300 mb-2">
                Phone Number
              </label>
              <div className="flex items-center gap-3 bg-slate-900/30 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3">
                <Phone className="w-5 h-5 text-slate-400" />
                <input
                  id="profile-phone"
                  type="tel"
                  defaultValue="+1 (555) 123-4567"
                  className="flex-1 bg-transparent text-slate-100 outline-none"
                />
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              Save Changes
            </button>
          </div>
        </div>

        <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-slate-100 mb-6">Security</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Current Password
              </label>
              <div className="flex items-center gap-3 bg-slate-900/30 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3">
                <Key className="w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  placeholder="Enter current password"
                  className="flex-1 bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                New Password
              </label>
              <div className="flex items-center gap-3 bg-slate-900/30 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3">
                <Key className="w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  placeholder="Enter new password"
                  className="flex-1 bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Confirm New Password
              </label>
              <div className="flex items-center gap-3 bg-slate-900/30 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3">
                <Key className="w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  className="flex-1 bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              Update Password
            </button>
          </div>
        </div>

        <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <Shield className="w-6 h-6 text-blue-400 mt-1" />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-100 mb-2">Two-Factor Authentication</h2>
              <p className="text-sm text-slate-400 mb-4">
                Add an extra layer of security to your account by enabling two-factor authentication.
              </p>
              <button className="bg-slate-700 hover:bg-slate-600 text-slate-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Enable 2FA
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
