import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, Trophy, FolderGit2, CheckCircle2, Clock, ArrowRight, Activity, Zap } from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

const ParticipantDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await dashboardService.getParticipantDashboard();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-24 pb-20 px-6 lg:px-12 max-w-7xl mx-auto space-y-6">
        <div className="h-40 rounded-2xl bg-surface animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 rounded-2xl bg-surface animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const registrationsCount = data?.myRegistrations?.length || 0;
  const activeTeamsCount = data?.myTeams?.length || 0;
  const submissionsCount = data?.mySubmissions?.length || 0;

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-20 px-6 lg:px-12 max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-r from-primary/20 via-success/10 to-transparent border border-primary/20 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
        <div className="relative z-10">
          <Badge variant="primary" className="mb-4 text-[10px]">Participant Portal</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Track your registered hackathons, team status, and project submissions from your central command center.
          </p>
        </div>
      </div>

      {/* 6-Stage Journey Timeline */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-mono tracking-wider text-muted-foreground uppercase flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" /> Hackathon Lifecycle Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            {/* Stage 1 */}
            <div className={`p-4 rounded-xl border ${registrationsCount > 0 ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-surface border-border text-muted-foreground'}`}>
              <div className="font-bold text-sm mb-1">1. Register</div>
              <div className="text-[10px] font-mono">{registrationsCount > 0 ? 'Completed' : 'Pending'}</div>
            </div>
            {/* Stage 2 */}
            <div className={`p-4 rounded-xl border ${activeTeamsCount > 0 ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-surface border-border text-muted-foreground'}`}>
              <div className="font-bold text-sm mb-1">2. Form Team</div>
              <div className="text-[10px] font-mono">{activeTeamsCount > 0 ? 'Active' : 'Not Joined'}</div>
            </div>
            {/* Stage 3 */}
            <div className={`p-4 rounded-xl border ${registrationsCount > 0 ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-surface border-border text-muted-foreground'}`}>
              <div className="font-bold text-sm mb-1">3. Approval</div>
              <div className="text-[10px] font-mono">Organizer Status</div>
            </div>
            {/* Stage 4 */}
            <div className={`p-4 rounded-xl border ${submissionsCount > 0 ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-surface border-border text-muted-foreground'}`}>
              <div className="font-bold text-sm mb-1">4. Submit Project</div>
              <div className="text-[10px] font-mono">{submissionsCount > 0 ? 'Submitted' : 'Pending'}</div>
            </div>
            {/* Stage 5 */}
            <div className="p-4 rounded-xl border bg-surface border-border text-muted-foreground">
              <div className="font-bold text-sm mb-1">5. Under Review</div>
              <div className="text-[10px] font-mono">Judging Phase</div>
            </div>
            {/* Stage 6 */}
            <div className="p-4 rounded-xl border bg-surface border-border text-muted-foreground">
              <div className="font-bold text-sm mb-1">6. Results</div>
              <div className="text-[10px] font-mono">Leaderboard</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card hoverEffect className="group">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold mb-1 uppercase tracking-wider">Registrations</p>
              <h3 className="text-4xl font-black text-foreground">{registrationsCount}</h3>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-7 h-7" />
            </div>
          </CardContent>
        </Card>

        <Card hoverEffect className="group">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold mb-1 uppercase tracking-wider">Active Teams</p>
              <h3 className="text-4xl font-black text-foreground">{activeTeamsCount}</h3>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-7 h-7" />
            </div>
          </CardContent>
        </Card>

        <Card hoverEffect className="group">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold mb-1 uppercase tracking-wider">Submissions</p>
              <h3 className="text-4xl font-black text-foreground">{submissionsCount}</h3>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-success/10 border border-success/20 text-success flex items-center justify-center group-hover:scale-110 transition-transform">
              <FolderGit2 className="w-7 h-7" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/participant/registrations">
          <Card hoverEffect className="h-full group">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors">My Registrations</h4>
                <p className="text-xs text-muted-foreground">View application approvals and status.</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </CardContent>
          </Card>
        </Link>

        <Link to="/participant/teams">
          <Card hoverEffect className="h-full group">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors">Team Management</h4>
                <p className="text-xs text-muted-foreground">Manage teams, invite members, or accept invites.</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </CardContent>
          </Card>
        </Link>

        <Link to="/participant/submissions">
          <Card hoverEffect className="h-full group">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors">Project Submissions</h4>
                <p className="text-xs text-muted-foreground">Create or edit project submissions.</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default ParticipantDashboard;
