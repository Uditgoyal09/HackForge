import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, ArrowLeft, Loader2, Trash2, ShieldCheck, Search } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { hackathonService } from '../../services/hackathonService';
import JudgeSelector from '../../components/organizer/JudgeSelector';
import { toast } from 'sonner';

const ManageJudges = () => {
  const { id } = useParams();
  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // State for newly selected judges to add
  const [selectedNewJudges, setSelectedNewJudges] = useState([]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await hackathonService.getHackathonById(id);
      if (res.success) {
        setHackathon(res.data);
      }
    } catch (err) {
      toast.error('Failed to load hackathon data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddJudges = async () => {
    if (selectedNewJudges.length === 0) return;
    
    // We update the hackathon with all current judges + new judges
    const currentJudgeIds = hackathon.judges ? hackathon.judges.map(j => j.user._id || j.user) : [];
    
    // Filter out ones already present just in case
    const uniqueNew = selectedNewJudges.filter(newId => !currentJudgeIds.includes(newId));
    
    if (uniqueNew.length === 0) {
      toast.error('Selected judges are already assigned');
      setIsAdding(false);
      setSelectedNewJudges([]);
      return;
    }
    
    const combinedJudges = [...currentJudgeIds, ...uniqueNew];
    
    try {
      const res = await hackathonService.updateHackathon(id, { judges: combinedJudges });
      if (res.success) {
        toast.success('Judges added successfully');
        setHackathon(res.data);
        setIsAdding(false);
        setSelectedNewJudges([]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add judges');
    }
  };

  const handleRemoveJudge = async (judgeId) => {
    if (!window.confirm('Are you sure you want to remove this judge? If they have completed reviews, you may lose that data.')) {
      return;
    }
    
    const currentJudgeIds = hackathon.judges ? hackathon.judges.map(j => j.user._id || j.user) : [];
    const newJudges = currentJudgeIds.filter(id => id.toString() !== judgeId.toString());
    
    try {
      const res = await hackathonService.updateHackathon(id, { judges: newJudges });
      if (res.success) {
        toast.success('Judge removed successfully');
        setHackathon(res.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove judge');
    }
  };

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

  const judges = hackathon.judges || [];

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <PageHeader 
          title="Manage Judges" 
          description={`Hackathon Judge Pool for ${hackathon.title}`}
          showBack={true}
        />

        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight">Assigned Judges ({judges.length})</h2>
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground text-sm font-semibold rounded-[var(--radius-md)] transition-colors"
            >
              {isAdding ? 'Cancel' : 'Add Judge'}
            </button>
          </div>

          {isAdding && (
            <div className="mb-8 p-6 bg-surface border border-border rounded-[var(--radius-lg)] shadow-sm">
              <h3 className="font-bold text-foreground mb-4">Assign New Judges</h3>
              <JudgeSelector 
                selectedJudges={selectedNewJudges}
                onChange={setSelectedNewJudges}
              />
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={handleAddJudges}
                  disabled={selectedNewJudges.length === 0}
                  className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-primary-foreground text-sm font-semibold rounded-[var(--radius-md)] disabled:opacity-50 transition-colors"
                >
                  Confirm Assignment
                </button>
              </div>
            </div>
          )}

          <div className="bg-surface border border-border rounded-[var(--radius-lg)] overflow-hidden shadow-sm">
            {judges.length === 0 ? (
              <div className="p-12 text-center">
                <ShieldCheck className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">No Judges Assigned</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  You haven't added any judges to this hackathon yet. Click "Add Judge" to invite qualified evaluators to the judge pool.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-background/50 border-b border-border">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-muted-foreground uppercase text-xs">Judge</th>
                      <th className="px-6 py-4 font-semibold text-muted-foreground uppercase text-xs">Status</th>
                      <th className="px-6 py-4 font-semibold text-muted-foreground uppercase text-xs">Assigned On</th>
                      <th className="px-6 py-4 font-semibold text-muted-foreground uppercase text-xs text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {judges.map((j) => (
                      <tr key={j._id} className="hover:bg-surface-hover/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {/* Ideally, we'd populate the user info in getHackathon. We assume it's somewhat available or we just show the ID for now */}
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                              J
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">Judge ID: {j.user}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            j.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                          }`}>
                            {j.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {new Date(j.assignedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleRemoveJudge(j.user)}
                            className="p-2 text-muted-foreground hover:text-error hover:bg-error/10 rounded-[var(--radius-sm)] transition-colors"
                            title="Remove Judge"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageJudges;
