import React, { useState } from 'react';
import { User, Lock, Mail, Globe, Shield, Save } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { authService } from '../../services/authService';
import { toast } from 'sonner';

const UserProfilePage = () => {
  const { user, updateUser } = useAuth();

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.profile?.bio || '');
  const [skills, setSkills] = useState(user?.profile?.skills?.join(', ') || '');
  const [college, setCollege] = useState(user?.profile?.college || '');
  const [github, setGithub] = useState(user?.profile?.github || '');
  const [linkedin, setLinkedin] = useState(user?.profile?.linkedin || '');
  const [portfolio, setPortfolio] = useState(user?.profile?.portfolio || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
      const res = await userService.updateProfile({
        name,
        bio,
        skills: skillsArray,
        college,
        github,
        linkedin,
        portfolio,
      });

      if (res.success) {
        toast.success('Profile updated successfully!');
        updateUser(res.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Please fill in password fields');
      return;
    }

    setSavingPassword(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        <PageHeader 
          showBack 
          title="Account Settings & Profile"
          description="Manage your public portfolio, developer skills, and security preferences."
        />

        <div className="space-y-8">
          {/* Profile Form */}
          <div className="bg-surface/50 border border-border/80 rounded-[var(--radius-lg)] p-6 sm:p-8">
            <h3 className="font-bold text-lg text-foreground mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Developer Profile
            </h3>

            <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-muted-foreground mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background border border-input rounded-[var(--radius-md)] text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-muted-foreground mb-1.5">College / University</label>
                  <input
                    type="text"
                    placeholder="e.g. Stanford University"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background border border-input rounded-[var(--radius-md)] text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground mb-1.5">Short Bio</label>
                <textarea
                  rows={3}
                  placeholder="Tell us about your developer journey..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-[var(--radius-md)] text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground mb-1.5">Skills (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="React, Node.js, Solidity, Python"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-[var(--radius-md)] text-xs text-foreground font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block font-semibold text-muted-foreground mb-1.5">GitHub Profile URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/username"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    className="w-full px-3 py-2.5 bg-background border border-input rounded-[var(--radius-md)] text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-muted-foreground mb-1.5">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="w-full px-3 py-2.5 bg-background border border-input rounded-[var(--radius-md)] text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-muted-foreground mb-1.5">Portfolio Website URL</label>
                  <input
                    type="url"
                    placeholder="https://myportfolio.dev"
                    value={portfolio}
                    onChange={(e) => setPortfolio(e.target.value)}
                    className="w-full px-3 py-2.5 bg-background border border-input rounded-[var(--radius-md)] text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="px-6 py-2.5 rounded-[var(--radius-md)] bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs transition-all shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center gap-1.5 mt-4"
              >
                <Save className="w-4 h-4" /> {savingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-surface/50 border border-border/80 rounded-[var(--radius-lg)] p-6 sm:p-8">
            <h3 className="font-bold text-lg text-foreground mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" /> Security & Password
            </h3>

            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md text-xs">
              <div>
                <label className="block font-semibold text-muted-foreground mb-1.5">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-[var(--radius-md)] text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground mb-1.5">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-[var(--radius-md)] text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                disabled={savingPassword}
                className="px-6 py-2.5 rounded-[var(--radius-md)] bg-surface-elevated hover:bg-surface-hover text-foreground font-semibold text-xs transition-all disabled:opacity-50"
              >
                {savingPassword ? 'Updating...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
