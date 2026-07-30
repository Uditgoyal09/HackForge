import React, { useState, useEffect } from 'react';
import { Search, UserCheck, X, Loader2 } from 'lucide-react';
import { judgeService } from '../../services/judgeService';
import { toast } from 'sonner';

const JudgeSelector = ({ selectedJudges, onChange }) => {
  const [search, setSearch] = useState('');
  const [availableJudges, setAvailableJudges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJudges = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await judgeService.getAvailableJudges({ search, limit: 10 });
        if (res.success) {
          setAvailableJudges(res.data);
        }
      } catch (err) {
        setError('Failed to fetch judges');
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(() => fetchJudges(), 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const handleSelect = (judge) => {
    if (!selectedJudges.find(j => j === judge._id || j.user === judge._id)) {
      onChange([...selectedJudges, judge._id]);
    }
  };

  const handleRemove = (judgeId) => {
    onChange(selectedJudges.filter(j => j !== judgeId && j.user !== judgeId));
  };

  const getAvatar = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search judges by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-background border border-input rounded-[var(--radius-md)] text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
        />
      </div>

      {/* Available Judges List */}
      <div className="border border-border rounded-[var(--radius-md)] overflow-hidden">
        <div className="bg-surface px-4 py-2 text-xs font-bold text-muted-foreground uppercase border-b border-border">
          Available Judges
        </div>
        <div className="max-h-48 overflow-y-auto bg-background p-2 space-y-1">
          {loading ? (
            <div className="flex items-center justify-center p-4 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading judges...
            </div>
          ) : error ? (
            <div className="text-center p-4 text-error text-sm">{error}</div>
          ) : availableJudges.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground text-sm">No judges found.</div>
          ) : (
            availableJudges.map((judge) => {
              const isSelected = selectedJudges.find(j => j === judge._id || j.user === judge._id);
              return (
                <div
                  key={judge._id}
                  className={`flex items-center justify-between p-2 rounded-[var(--radius-sm)] transition-colors ${
                    isSelected ? 'bg-primary/10 border border-primary/20' : 'hover:bg-surface-hover border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={judge.avatar?.url || getAvatar(judge.name)}
                      alt={judge.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-semibold text-foreground leading-tight">{judge.name}</p>
                      <p className="text-xs text-muted-foreground">{judge.email}</p>
                    </div>
                  </div>
                  {isSelected ? (
                    <button
                      type="button"
                      onClick={() => handleRemove(judge._id)}
                      className="text-xs font-semibold text-error hover:text-error-hover px-2 py-1 flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSelect(judge)}
                      className="text-xs font-semibold text-primary hover:text-primary-hover px-2 py-1 flex items-center gap-1"
                    >
                      <UserCheck className="w-3.5 h-3.5" /> Select
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Selected Summary */}
      {selectedJudges.length > 0 && (
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary font-bold">
            {selectedJudges.length}
          </span>
          Judges assigned to this hackathon.
        </div>
      )}
    </div>
  );
};

export default JudgeSelector;
