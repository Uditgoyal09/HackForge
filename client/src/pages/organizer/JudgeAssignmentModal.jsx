import React, { useState, useEffect } from 'react';
import { UserCheck, X } from 'lucide-react';
import { judgeService } from '../../services/judgeService';
import { adminService } from '../../services/adminService';
import { toast } from 'sonner';

const JudgeAssignmentModal = ({ submission, onClose, onSuccess }) => {
  const [judges, setJudges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    const fetchJudges = async () => {
      setLoading(true);
      try {
        const res = await adminService.getUsers({ role: 'judge' });
        if (res.success && res.data) {
          setJudges(res.data);
        }
      } catch {
        toast.error('Failed to load judges list');
      } finally {
        setLoading(false);
      }
    };
    fetchJudges();
  }, []);

  const handleAssign = async (judgeId) => {
    setAssigning(true);
    try {
      await judgeService.assignJudge(submission._id, judgeId);
      toast.success('Judge assigned successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Judge assignment failed');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 max-w-md w-full text-foreground relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-bold text-lg mb-1">Assign Judge</h3>
        <p className="text-xs text-muted-foreground mb-4">Project: <span className="text-foreground font-semibold">{submission.projectName}</span></p>

        {loading ? (
          <p className="text-xs text-muted-foreground text-center py-6">Loading judges list...</p>
        ) : judges.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">No judge accounts found in system.</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {judges.map((j) => (
              <div key={j._id} className="p-3 rounded-[var(--radius-md)] bg-background border border-border flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-foreground">{j.name}</p>
                  <p className="text-[11px] text-muted-foreground">{j.email}</p>
                </div>

                <button
                  onClick={() => handleAssign(j._id)}
                  disabled={assigning}
                  className="px-3 py-1.5 rounded-[var(--radius-md)] bg-primary hover:bg-primary-hover text-primary-foreground font-semibold flex items-center gap-1 disabled:opacity-50"
                >
                  <UserCheck className="w-3.5 h-3.5" /> Assign
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JudgeAssignmentModal;
