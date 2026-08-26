// app/dashboard/pages/settings/MyProfileSettings.tsx
import React, { useEffect, useState } from 'react';
import { Save, Check, Loader2, User, Mail, Shield, Lock, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/lib/toast';

interface MyProfileSettingsProps {
  settings?: any;
  setSettings?: (settings: any) => void;
}

const MyProfileSettings: React.FC<MyProfileSettingsProps> = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [initials, setInitials] = useState('??');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const user = data?.user;
      if (!user) {
        setLoading(false);
        return;
      }
      setUserId(user.id);
      setEmail(user.email ?? '');
      const name = user.user_metadata?.full_name || user.user_metadata?.name || '';
      setFullName(name);
      const init = name
        ? name.split(' ').filter(Boolean).slice(0, 2).map((w: string) => w[0].toUpperCase()).join('')
        : (user.email ?? '').slice(0, 2).toUpperCase();
      setInitials(init || '??');
      setLoading(false);
    });
  }, []);

  const handleProfileSave = async () => {
    if (!fullName.trim()) {
      addToast('error', 'Name cannot be empty');
      return;
    }
    setSavingProfile(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName.trim(), name: fullName.trim() },
      });
      if (error) throw error;
      // Update initials
      const init = fullName.trim().split(' ').filter(Boolean).slice(0, 2).map((w: string) => w[0].toUpperCase()).join('');
      setInitials(init || '??');
      setProfileSaved(true);
      addToast('success', 'Profile updated successfully');
      setTimeout(() => setProfileSaved(false), 2000);
    } catch (err: any) {
      addToast('error', err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      addToast('error', 'Please fill in all password fields');
      return;
    }
    if (newPassword.length < 6) {
      addToast('error', 'New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('error', 'New passwords do not match');
      return;
    }
    setSavingPassword(true);
    try {
      const supabase = createClient();
      // Re-authenticate by signing in with current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });
      if (signInError) throw new Error('Current password is incorrect');

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) throw updateError;

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSaved(true);
      addToast('success', 'Password updated successfully');
      setTimeout(() => setPasswordSaved(false), 2000);
    } catch (err: any) {
      addToast('error', err.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-darkGreen)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
        <div>
          <h3 className="text-base font-semibold text-gray-900">My Profile</h3>
          <p className="text-sm text-gray-500 mt-0.5">Manage your personal information and account settings</p>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #d97706, #b45309)', boxShadow: '0 4px 12px rgba(217,119,6,0.3)' }}
          >
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{fullName || 'User'}</p>
            <p className="text-sm text-gray-500">{email}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-darkGreen)]/20 focus:border-[var(--color-darkGreen)]/50 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={email}
              disabled
              className="w-full pl-9 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1.5">Email cannot be changed. Contact support if you need to update it.</p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleProfileSave}
            disabled={savingProfile}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-xl transition-all hover:shadow-lg disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, var(--color-darkGreen), var(--color-mediumGreen))' }}
          >
            {savingProfile ? <Loader2 size={16} className="animate-spin" /> : profileSaved ? <Check size={16} /> : <Save size={16} />}
            {profileSaved ? 'Saved' : 'Save Profile'}
          </button>
        </div>
      </div>

      {/* Security / Password — integrated */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(var(--color-darkGreen-rgb, 4,120,87), 0.1)' }}>
            <Shield size={16} className="text-[var(--color-darkGreen)]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Password & Security</h3>
            <p className="text-sm text-gray-500">Update your password securely</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full pl-9 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full pl-9 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full pl-9 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handlePasswordChange}
            disabled={savingPassword}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-xl transition-all hover:shadow-lg disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, var(--color-darkGreen), var(--color-mediumGreen))' }}
          >
            {savingPassword ? <Loader2 size={16} className="animate-spin" /> : passwordSaved ? <Check size={16} /> : <Shield size={16} />}
            {passwordSaved ? 'Updated' : 'Update Password'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyProfileSettings;
