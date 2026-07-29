import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, ExternalLink, Star } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { GithubIcon } from '../../components/common/SocialIcons';
import { submissionService } from '../../services/submissionService';
import { judgeService } from '../../services/judgeService';
import { toast } from 'sonner';

const EvaluationInterface = () => {
  const { id } = useParams(); // submissionId
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [criteriaScores, setCriteriaScores] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchSubmissionDetails = async () => {
      setLoading(true);
      try {
        const res = await submissionService.getSubmissionDetails(id);
        if (res.success && res.data) {
          setSubmission(res.data);
          const criteria = res.data.hackathon?.judgingCriteria || [
            { name: 'Innovation', maxScore: 50 },
            { name: 'Technical Execution', maxScore: 50 },
          ];
          setCriteriaScores(
            criteria.map(c => ({
              criterionName: c.name,
              score: Math.floor(c.maxScore * 0.8),
              maxScore: c.maxScore,
            }))
          );
        }
      } catch (err) {
        toast.error('Failed to load submission details');
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissionDetails();
  }, [id]);

  const handleScoreChange = (index, newScore) => {
    const next = [...criteriaScores];
    const max = next[index].maxScore;
    next[index].score = Math.min(max, Math.max(0, Number(newScore)));
    setCriteriaScores(next);
  };

  const calculatedTotal = criteriaScores.reduce((acc, c) => acc + (c.score || 0), 0);
  const maxPossibleTotal = criteriaScores.reduce((acc, c) => acc + (c.maxScore || 0), 0);

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) {
      toast.error('Please provide written feedback for the team');
      return;
    }

    const payload = {
      criteriaScores: criteriaScores.map(c => ({
        criterionName: c.criterionName,
        score: c.score,
      })),
      feedback,
      status: 'submitted',
    };

    setSubmitting(true);
    try {
      const res = await judgeService.submitReview(id, payload);
      if (res.success) {
        toast.success('Evaluation submitted successfully!');
        navigate('/judge/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit evaluation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-24 p-6 max-w-5xl mx-auto space-y-6">
        <div className="h-64 rounded-[var(--radius-lg)] bg-surface-elevated border border-border animate-pulse" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-24 text-center p-6">
        <h2 className="text-2xl font-bold">Submission Not Found</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-6 lg:px-12">
        <PageHeader 
          showBack 
          title={`Evaluate: ${submission.projectName}`}
          description={`Hackathon: ${submission.hackathon?.title}`}
          unsavedChanges={feedback.trim().length > 0}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Project Details Panel */}
          <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 space-y-6">
            <h3 className="font-bold text-base text-foreground border-b border-border pb-3">Project Deliverables</h3>

            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Problem Statement</p>
              <p className="text-xs text-foreground leading-relaxed bg-background p-3 rounded-[var(--radius-md)] border border-border">
                {submission.problemStatement}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Solution & Architecture</p>
              <p className="text-xs text-foreground leading-relaxed bg-background p-3 rounded-[var(--radius-md)] border border-border">
                {submission.solution}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">Tech Stack</p>
              <div className="flex flex-wrap gap-1.5">
                {submission.techStack?.map((t, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-[var(--radius-sm)] bg-background border border-border text-xs font-mono text-primary">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center gap-4">
              {submission.githubRepository && (
                <a href={submission.githubRepository} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-[var(--radius-md)] bg-background border border-border text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5">
                  <GithubIcon className="w-4 h-4" /> GitHub Repository
                </a>
              )}
              {submission.liveDemoUrl && (
                <a href={submission.liveDemoUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-[var(--radius-md)] bg-primary/10 border border-primary/20 text-xs font-semibold text-primary hover:bg-primary/20 flex items-center gap-1.5">
                  <ExternalLink className="w-4 h-4" /> Live Demo
                </a>
              )}
            </div>
          </div>

          {/* Scoring Form */}
          <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground">Dynamic Criteria Scoring</h3>
              <span className="px-3 py-1 rounded-[var(--radius-sm)] bg-primary/10 text-primary border border-primary/20 text-xs font-mono font-bold">
                Total Preview: {calculatedTotal} / {maxPossibleTotal}
              </span>
            </div>

            <form onSubmit={handleSubmitEvaluation} className="space-y-6">
              {criteriaScores.map((c, i) => (
                <div key={i} className="p-4 rounded-[var(--radius-md)] bg-background border border-border space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{c.criterionName}</span>
                    <span className="font-mono text-primary font-bold">{c.score} / {c.maxScore} Pts</span>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={c.maxScore}
                    value={c.score}
                    onChange={(e) => handleScoreChange(i, e.target.value)}
                    className="w-full accent-primary bg-surface rounded-lg cursor-pointer"
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Written Judge Feedback</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide constructive feedback for the team..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-[var(--radius-md)] text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-[var(--radius-md)] bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-sm transition-all shadow-xl shadow-primary/30 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" /> {submitting ? 'Submitting Evaluation...' : 'Submit Evaluation'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationInterface;
