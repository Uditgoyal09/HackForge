import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FolderGit2, ExternalLink, Plus, X, Upload, CheckCircle2, Lock, FileText, Video } from 'lucide-react';
import { GithubIcon } from '../../components/common/SocialIcons';
import { submissionService } from '../../services/submissionService';
import { registrationService } from '../../services/registrationService';
import { teamService } from '../../services/teamService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const submissionSchema = z.object({
  projectName: z.string().min(3, 'Project name must be at least 3 characters'),
  problemStatement: z.string().min(10, 'Problem statement must be at least 10 characters'),
  solution: z.string().min(10, 'Solution description must be at least 10 characters'),
  githubRepository: z.string().url('Must be a valid GitHub URL'),
  liveDemoUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

const ProjectSubmission = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [selectedHackathon, setSelectedHackathon] = useState('');
  const [team, setTeam] = useState(null);
  const [existingSubmission, setExistingSubmission] = useState(null);

  const [techStack, setTechStack] = useState([]);
  const [techInput, setTechInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(submissionSchema),
  });

  const fetchInitial = async () => {
    setLoading(true);
    try {
      const res = await registrationService.getMyRegistrations();
      if (res.success && res.data) {
        const approved = res.data.filter(r => r.status === 'approved' && r.team);
        setRegistrations(approved);
        if (approved.length > 0) {
          setSelectedHackathon(approved[0].hackathon?._id || approved[0].hackathon);
        }
      }
    } catch {
      toast.error('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamAndSubmission = async (hackathonId) => {
    if (!hackathonId) return;
    try {
      const reg = registrations.find(r => (r.hackathon?._id || r.hackathon) === hackathonId);
      if (reg && reg.team) {
        const teamId = typeof reg.team === 'object' ? reg.team._id : reg.team;
        const teamRes = await teamService.getTeamDetails(teamId);
        if (teamRes.success && teamRes.data) {
          setTeam(teamRes.data);
        }
      }

      // Check existing submission
      const subRes = await submissionService.getHackathonSubmissions(hackathonId);
      if (subRes.success && subRes.data && subRes.data.length > 0) {
        const sub = subRes.data[0];
        setExistingSubmission(sub);
        setValue('projectName', sub.projectName);
        setValue('problemStatement', sub.problemStatement);
        setValue('solution', sub.solution);
        setValue('githubRepository', sub.githubRepository);
        setValue('liveDemoUrl', sub.liveDemoUrl || '');
        setTechStack(sub.techStack || []);
      } else {
        setExistingSubmission(null);
      }
    } catch {
      setExistingSubmission(null);
    }
  };

  useEffect(() => {
    fetchInitial();
  }, []);

  useEffect(() => {
    if (selectedHackathon) {
      fetchTeamAndSubmission(selectedHackathon);
    }
  }, [selectedHackathon, registrations]);

  const handleAddTech = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      if (techInput.trim() && !techStack.includes(techInput.trim())) {
        setTechStack([...techStack, techInput.trim()]);
        setTechInput('');
      }
    }
  };

  const handleRemoveTech = (tech) => {
    setTechStack(techStack.filter(t => t !== tech));
  };

  const onSubmit = async (formData) => {
    if (techStack.length === 0) {
      toast.error('Please add at least one tech stack tag');
      return;
    }

    const payload = {
      ...formData,
      techStack,
    };

    setSubmitting(true);
    try {
      if (existingSubmission) {
        await submissionService.updateSubmission(existingSubmission._id, payload);
        toast.success('Project submission updated successfully!');
      } else {
        await submissionService.createSubmission(selectedHackathon, payload);
        toast.success('Project submitted successfully!');
      }
      fetchTeamAndSubmission(selectedHackathon);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const isLeader = team && team.leader?._id === user?._id;

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight">Project Submission</h1>
          <p className="text-slate-400 text-sm mt-1">Submit or edit your team's project repository and deliverables.</p>
        </div>

        {/* Hackathon Selector */}
        {registrations.length > 0 && (
          <div className="mb-8 max-w-xs">
            <label className="block text-xs font-semibold text-slate-400 mb-2">Select Hackathon</label>
            <select
              value={selectedHackathon}
              onChange={(e) => setSelectedHackathon(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              {registrations.map(r => (
                <option key={r._id} value={r.hackathon?._id || r.hackathon}>
                  {r.hackathon?.title || 'Approved Event'}
                </option>
              ))}
            </select>
          </div>
        )}

        {loading ? (
          <div className="h-96 rounded-3xl bg-slate-900/60 border border-slate-800/80 animate-pulse" />
        ) : !selectedHackathon || !team ? (
          <div className="text-center py-20 bg-slate-900/30 border border-slate-800/50 rounded-3xl p-8">
            <FolderGit2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="font-bold text-lg text-slate-300">No Eligible Team Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              You must belong to a team before submitting a project for a hackathon.
            </p>
          </div>
        ) : !isLeader ? (
          <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm flex items-center gap-3">
            <Lock className="w-6 h-6 shrink-0" />
            <p>Only the designated Team Leader ({team.leader?.name}) can submit or edit the project repository.</p>
          </div>
        ) : (
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 sm:p-10 space-y-6">
            {existingSubmission && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Project Submitted (Status: {existingSubmission.status?.toUpperCase()})
                </span>
                <span className="text-[11px] text-emerald-500/80">
                  Last updated: {new Date(existingSubmission.updatedAt || existingSubmission.createdAt).toLocaleString()}
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Project Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Project Title</label>
                <input
                  type="text"
                  placeholder="e.g. DeFi Swap Protocol"
                  {...register('projectName')}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                {errors.projectName && <p className="text-xs text-rose-400 mt-1">{errors.projectName.message}</p>}
              </div>

              {/* Problem Statement */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Problem Statement</label>
                <textarea
                  rows={3}
                  placeholder="What problem does your project solve?"
                  {...register('problemStatement')}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                {errors.problemStatement && <p className="text-xs text-rose-400 mt-1">{errors.problemStatement.message}</p>}
              </div>

              {/* Solution */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Solution & Architecture</label>
                <textarea
                  rows={3}
                  placeholder="Describe your technical implementation and architecture."
                  {...register('solution')}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                {errors.solution && <p className="text-xs text-rose-400 mt-1">{errors.solution.message}</p>}
              </div>

              {/* GitHub Repo & Live Demo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">GitHub Repository URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/org/repo"
                    {...register('githubRepository')}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  {errors.githubRepository && <p className="text-xs text-rose-400 mt-1">{errors.githubRepository.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Live Demo URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://my-demo.app"
                    {...register('liveDemoUrl')}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  {errors.liveDemoUrl && <p className="text-xs text-rose-400 mt-1">{errors.liveDemoUrl.message}</p>}
                </div>
              </div>

              {/* Tech Stack Chip Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tech Stack Technologies</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Type technology name and press Enter (e.g. React)..."
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={handleAddTech}
                    className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddTech}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-white hover:bg-slate-700"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {techStack.map((tech, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono">
                      {tech}
                      <button type="button" onClick={() => handleRemoveTech(tech)} className="hover:text-rose-400">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-xl shadow-indigo-600/30 disabled:opacity-50"
              >
                {submitting ? 'Saving Submission...' : existingSubmission ? 'Update Project Submission' : 'Submit Project'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectSubmission;
