import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, ExternalLink, ArrowLeft, Star } from 'lucide-react';
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
      <div className="min-h-screen bg-slate-950 text-white pt-24 p-6 max-w-5xl mx-auto space-y-6">
        <div className="h-64 rounded-3xl bg-slate-900/60 border border-slate-800 animate-pulse" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-slate-950 text-white pt-24 text-center p-6">
        <h2 className="text-2xl font-bold">Submission Not Found</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-6 lg:px-12">
        <div className="mb-8">
          <Link to="/judge/dashboard" className="text-xs text-indigo-400 hover:underline flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Assignments
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Evaluate: {submission.projectName}
          </h1>
          <p className="text-slate-400 text-sm mt-1">Hackathon: {submission.hackathon?.title}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Project Details Panel */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 space-y-6">
            <h3 className="font-bold text-base text-white border-b border-slate-800/60 pb-3">Project Deliverables</h3>

            <div>
              <p className="text-xs font-semibold text-slate-400 mb-1">Problem Statement</p>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/50">
                {submission.problemStatement}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400 mb-1">Solution & Architecture</p>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/50">
                {submission.solution}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400 mb-2">Tech Stack</p>
              <div className="flex flex-wrap gap-1.5">
                {submission.techStack?.map((t, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-indigo-400">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/60 flex items-center gap-4">
              {submission.githubRepository && (
                <a href={submission.githubRepository} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 hover:text-white flex items-center gap-1.5">
                  <GithubIcon className="w-4 h-4" /> GitHub Repository
                </a>
              )}
              {submission.liveDemoUrl && (
                <a href={submission.liveDemoUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300 hover:bg-indigo-600/20 flex items-center gap-1.5">
                  <ExternalLink className="w-4 h-4" /> Live Demo
                </a>
              )}
            </div>
          </div>

          {/* Scoring Form */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <h3 className="font-bold text-base text-white">Dynamic Criteria Scoring</h3>
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-mono font-bold">
                Total Preview: {calculatedTotal} / {maxPossibleTotal}
              </span>
            </div>

            <form onSubmit={handleSubmitEvaluation} className="space-y-6">
              {criteriaScores.map((c, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/60 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{c.criterionName}</span>
                    <span className="font-mono text-indigo-400 font-bold">{c.score} / {c.maxScore} Pts</span>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={c.maxScore}
                    value={c.score}
                    onChange={(e) => handleScoreChange(i, e.target.value)}
                    className="w-full accent-indigo-500 bg-slate-900 rounded-lg cursor-pointer"
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Written Judge Feedback</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide constructive feedback for the team..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-xl shadow-indigo-600/30 disabled:opacity-50 flex items-center justify-center gap-2"
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
