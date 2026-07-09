'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Settings, User, Lock, Bell, Palette, Save, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { userApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
});

const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Current password required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
] as const;

type Tab = (typeof TABS)[number]['id'];

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const { theme, setTheme } = useUIStore();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '', email: user?.email || '' },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const [prefs, setPrefs] = useState({
    emailAlerts: user?.preferences?.notifications?.email ?? true,
    inAppAlerts: user?.preferences?.notifications?.inApp ?? true,
    slackAlerts: user?.preferences?.notifications?.slack ?? false,
  });

  const profileMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => userApi.updateProfile(data),
    onSuccess: (res) => {
      setUser(res.data.data);
      toast.success('Profile updated');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const passwordMutation = useMutation({
    mutationFn: ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) =>
      userApi.changePassword(oldPassword, newPassword),
    onSuccess: () => {
      passwordForm.reset();
      toast.success('Password changed');
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to change password';
      toast.error(msg);
    },
  });

  const prefsMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => userApi.updatePreferences(data),
    onSuccess: () => toast.success('Preferences saved'),
    onError: () => toast.error('Failed to save preferences'),
  });

  const onProfileSubmit = (data: ProfileForm) => {
    profileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordForm) => {
    passwordMutation.mutate({ oldPassword: data.oldPassword, newPassword: data.newPassword });
  };

  const saveNotificationPrefs = () => {
    prefsMutation.mutate({
      notifications: {
        email: prefs.emailAlerts,
        inApp: prefs.inAppAlerts,
        slack: prefs.slackAlerts,
      },
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6" /> Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your account, security, and preferences
        </p>
      </div>

      {/* User card */}
      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-xl font-bold text-primary">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="info" className="text-xs capitalize">{user?.role}</Badge>
              {user?.isEmailVerified ? (
                <Badge variant="success" className="text-xs">Verified</Badge>
              ) : (
                <Badge variant="warning" className="text-xs">Unverified</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary rounded-lg p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === id
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {activeTab === 'profile' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile Information</CardTitle>
            <CardDescription>Update your display name and email address</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Full Name</label>
                <Input {...profileForm.register('name')} placeholder="Your name" />
                {profileForm.formState.errors.name && (
                  <p className="text-xs text-destructive">{profileForm.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Email Address</label>
                <Input {...profileForm.register('email')} type="email" placeholder="you@company.com" />
                {profileForm.formState.errors.email && (
                  <p className="text-xs text-destructive">{profileForm.formState.errors.email.message}</p>
                )}
              </div>
              <Button
                type="submit"
                size="sm"
                loading={profileMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" /> Save Profile
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Security tab */}
      {activeTab === 'security' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Change Password</CardTitle>
            <CardDescription>Use a strong password of at least 8 characters</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Current Password</label>
                <div className="relative">
                  <Input
                    {...passwordForm.register('oldPassword')}
                    type={showOld ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOld(!showOld)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordForm.formState.errors.oldPassword && (
                  <p className="text-xs text-destructive">{passwordForm.formState.errors.oldPassword.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">New Password</label>
                <div className="relative">
                  <Input
                    {...passwordForm.register('newPassword')}
                    type={showNew ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    className="pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-xs text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Confirm New Password</label>
                <Input
                  {...passwordForm.register('confirmPassword')}
                  type="password"
                  placeholder="Repeat new password"
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>
              <Button type="submit" size="sm" loading={passwordMutation.isPending}>
                <Lock className="w-4 h-4 mr-2" /> Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Notifications tab */}
      {activeTab === 'notifications' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notification Preferences</CardTitle>
            <CardDescription>Choose how you want to receive alerts and updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'emailAlerts' as const, label: 'Email Notifications', desc: 'Receive alerts and summaries via email' },
              { key: 'inAppAlerts' as const, label: 'In-App Notifications', desc: 'Show alerts inside the platform' },
              { key: 'slackAlerts' as const, label: 'Slack Notifications', desc: 'Send alerts to a Slack webhook' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <button
                  onClick={() => setPrefs((p) => ({ ...p, [key]: !p[key] }))}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    prefs[key] ? 'bg-primary' : 'bg-secondary'
                  }`}
                  role="switch"
                  aria-checked={prefs[key]}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      prefs[key] ? 'translate-x-4' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
            <div className="pt-2">
              <Button size="sm" onClick={saveNotificationPrefs} loading={prefsMutation.isPending}>
                <Save className="w-4 h-4 mr-2" /> Save Preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Appearance tab */}
      {activeTab === 'appearance' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Appearance</CardTitle>
            <CardDescription>Customize the look and feel of the platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-3">Theme</label>
              <div className="grid grid-cols-2 gap-3 max-w-xs">
                {(['dark', 'light'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTheme(t);
                      prefsMutation.mutate({ theme: t });
                    }}
                    className={`relative p-3 rounded-lg border-2 text-sm font-medium capitalize transition-colors ${
                      theme === t
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {t === 'dark' ? '🌙 Dark' : '☀️ Light'}
                    {theme === t && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
                    )}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Theme preference is saved to your account
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
