import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { hackathonService } from '../../services/hackathonService';
import { judgeService } from '../../services/judgeService';
import { Loader2, ArrowLeft, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';

const JudgeWorkspace = () => {
  const { id } = useParams();
  const [hackathon, setHackathon] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkspaceData = async () => {
      setLoading(true);
      try {
        const [hackRes, assignRes, actRes] = await Promise.all([
          hackathonService.getHackathonById(id),
          judgeService.getJudgeAssignments(),
          hackathonService.getHackathonActivity(id).catch(() => ({ data: [] })) // In case endpoint is not ready yet
        ]);
        
        if (hackRes.success) setHackathon(hackRes.data);
        
        if (assignRes.success) {
          // Filter assignments just for this hackathon
          const filtered = (assignRes.data || []).filter(a => {
            const hId = typeof a.hackathon === 'object' ? a.hackathon._id : a.hackathon;
            return hId === id;
          });
          setAssignments(filtered);
        }

        if (actRes && actRes.success) {
          setActivities(actRes.data || []);
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkspaceData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-20 flex justify-center items-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-20 text-center">
        <h2 className="text-2xl font-bold text-foreground">Hackathon Not Found</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <PageHeader 
          title="Judge Workspace"
          description={hackathon.title}
          showBack={true}
          backUrl="/judge/dashboard"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          
          {/* Main Content Area - Submissions to Evaluate */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6">
              <h3 className="font-bold text-lg text-foreground mb-6 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Assigned Submissions ({assignments.length})
              </h3>
              
              {assignments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm border border-border border-dashed rounded-[var(--radius-md)]">
                  No submissions have been assigned to you for this hackathon yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {assignments.map(assignment => {
                    const sub = assignment.submission;
                    return (
                      <div key={assignment._id} className="p-5 rounded-[var(--radius-md)] bg-background border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h4 className="font-bold text-foreground">{sub?.projectName}</h4>
                          <p className="text-xs text-muted-foreground mt-1">Team: {sub?.team?.name}</p>
                        </div>
                        <Link
                          to={`/judge/assignments/${sub?._id}`}
                          className="px-4 py-2 rounded-[var(--radius-md)] bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-1.5 whitespace-nowrap"
                        >
                          Evaluate Submission <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          
          {/* Sidebar - Activity & Info */}
          <div className="space-y-6">
            
            {/* Scoped Activity Log */}
            <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6">
              <h3 className="font-bold text-lg text-foreground mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Hackathon Activity
              </h3>
              
              <div className="space-y-4">
                {activities.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No recent activity.</p>
                ) : (
                  activities.map(act => (
                    <div key={act._id} className="text-sm">
                      <p className="text-foreground font-medium">{act.action.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-muted-foreground">{new Date(act.createdAt).toLocaleString()}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
            
          </div>

        </div>
      </div>
    </div>
  );
};

export default JudgeWorkspace;
