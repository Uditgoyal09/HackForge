import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FolderGit2, ExternalLink, Plus, X, Upload, CheckCircle2, Lock, FileText, Video } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
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

  // File states
  const [presentationFile, setPresentationFile] = useState(null);
  const [screenshotFiles, setScreenshotFiles] = useState([]);

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

    // Prepare payload
    let payload;
    
    // If files are present, we must use FormData
    if (presentationFile || screenshotFiles.length > 0) {
      payload = new FormData();
      payload.append('projectName', formData.projectName);
      payload.append('problemStatement', formData.problemStatement);
      payload.append('solution', formData.solution);
      payload.append('githubRepository', formData.githubRepository);
      if (formData.liveDemoUrl) payload.append('liveDemoUrl', formData.liveDemoUrl);
      payload.append('techStack', JSON.stringify(techStack));
      
      if (presentationFile) {
        payload.append('presentation', presentationFile);
      }
      
      if (screenshotFiles.length > 0) {
        Array.from(screenshotFiles).forEach(file => {
          payload.append('screenshots', file);
        });
      }
    } else {
      payload = {
        ...formData,
        techStack,
      };
    }

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
      
      // Clear file inputs after successful submission
      setPresentationFile(null);
      setScreenshotFiles([]);
      
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const isLeader = team && team.leader?._id === user?._id;

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <PageHeader 
          showBack 
          title="Project Submission"
          description="Submit or edit your team's project repository and deliverables."
        />

        {/* Hackathon Selector */}
        {registrations.length > 0 && (
          <div className="mb-8 max-w-xs">
            <label className="block text-xs font-semibold text-muted-foreground mb-2">Select Hackathon</label>
            <select
              value={selectedHackathon}
              onChange={(e) => setSelectedHackathon(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-input rounded-[var(--radius-md)] text-sm text-foreground focus:outline-none focus:border-primary"
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
          <div className="h-96 rounded-[var(--radius-lg)] bg-surface border border-border animate-pulse shadow-sm" />
        ) : !selectedHackathon || !team ? (
          <div className="flex flex-col items-center justify-center py-20 bg-surface/50 border border-border border-dashed rounded-[var(--radius-xl)] text-center max-w-3xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-surface-elevated border border-border flex items-center justify-center mb-6">
              <FolderGit2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-xl text-foreground mb-2">No Eligible Team Found</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
              You must belong to a team before submitting a project for a hackathon.
            </p>
          </div>
        ) : !isLeader ? (
          <div className="p-6 rounded-[var(--radius-lg)] bg-warning/10 border border-warning/20 text-warning text-sm flex items-center gap-3">
            <Lock className="w-6 h-6 shrink-0" />
            <p>Only the designated Team Leader ({team.leader?.name}) can submit or edit the project repository.</p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 sm:p-10 space-y-6">
            {existingSubmission && (
              <div className="p-4 rounded-[var(--radius-md)] bg-success/10 border border-success/20 text-success text-xs flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Project Submitted (Status: {existingSubmission.status?.toUpperCase()})
                </span>
                <span className="text-[11px] text-success/80">
                  Last updated: {new Date(existingSubmission.updatedAt || existingSubmission.createdAt).toLocaleString()}
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Project Name */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Project Title</label>
                <input
                  type="text"
                  placeholder="e.g. DeFi Swap Protocol"
                  {...register('projectName')}
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-[var(--radius-md)] text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                />
                {errors.projectName && <p className="text-xs text-error mt-1">{errors.projectName.message}</p>}
              </div>

              {/* Problem Statement */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Problem Statement</label>
                <textarea
                  rows={3}
                  placeholder="What problem does your project solve?"
                  {...register('problemStatement')}
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-[var(--radius-md)] text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                />
                {errors.problemStatement && <p className="text-xs text-error mt-1">{errors.problemStatement.message}</p>}
              </div>

              {/* Solution */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Solution & Architecture</label>
                <textarea
                  rows={3}
                  placeholder="Describe your technical implementation and architecture."
                  {...register('solution')}
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-[var(--radius-md)] text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                />
                {errors.solution && <p className="text-xs text-error mt-1">{errors.solution.message}</p>}
              </div>

              {/* GitHub Repo & Live Demo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">GitHub Repository URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/org/repo"
                    {...register('githubRepository')}
                    className="w-full px-4 py-2.5 bg-background border border-input rounded-[var(--radius-md)] text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                  />
                  {errors.githubRepository && <p className="text-xs text-error mt-1">{errors.githubRepository.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Live Demo URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://my-demo.app"
                    {...register('liveDemoUrl')}
                    className="w-full px-4 py-2.5 bg-background border border-input rounded-[var(--radius-md)] text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                  />
                  {errors.liveDemoUrl && <p className="text-xs text-error mt-1">{errors.liveDemoUrl.message}</p>}
                </div>
              </div>

              {/* Tech Stack Chip Input */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Tech Stack Technologies</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Type technology name and press Enter (e.g. React)..."
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={handleAddTech}
                    className="flex-1 px-4 py-2 bg-background border border-input rounded-[var(--radius-md)] text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={handleAddTech}
                    className="px-4 py-2 rounded-[var(--radius-md)] bg-surface-elevated border border-border text-xs text-foreground hover:bg-surface-hover"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {techStack.map((tech, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-sm)] bg-primary/10 border border-primary/20 text-primary text-xs font-mono">
                      {tech}
                      <button type="button" onClick={() => handleRemoveTech(tech)} className="hover:text-error">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* File Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" /> Presentation File
                  </label>
                  <p className="text-[10px] text-muted-foreground mb-3">Upload your pitch deck (PDF). Max 1 file.</p>
                  
                  <div className="relative border-2 border-dashed border-border rounded-[var(--radius-md)] p-4 text-center hover:bg-surface-elevated transition-colors">
                    <input 
                      type="file" 
                      accept=".pdf"
                      onChange={(e) => setPresentationFile(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                    <span className="text-xs text-foreground font-semibold">
                      {presentationFile ? presentationFile.name : 'Click or drag PDF here'}
                    </span>
                  </div>
                  {existingSubmission?.presentation && !presentationFile && (
                    <div className="mt-2 text-[11px] text-success flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Presentation previously uploaded
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-2">
                    <Video className="w-4 h-4 text-primary" /> Project Screenshots
                  </label>
                  <p className="text-[10px] text-muted-foreground mb-3">Upload screenshots of your project (PNG/JPG). Max 5 files.</p>
                  
                  <div className="relative border-2 border-dashed border-border rounded-[var(--radius-md)] p-4 text-center hover:bg-surface-elevated transition-colors">
                    <input 
                      type="file" 
                      accept="image/png, image/jpeg"
                      multiple
                      onChange={(e) => {
                        if (e.target.files.length > 5) {
                          toast.error('You can only upload a maximum of 5 screenshots');
                          e.target.value = '';
                          return;
                        }
                        setScreenshotFiles(e.target.files);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                    <span className="text-xs text-foreground font-semibold">
                      {screenshotFiles.length > 0 ? `${screenshotFiles.length} file(s) selected` : 'Click or drag Images here'}
                    </span>
                  </div>
                  {existingSubmission?.screenshots?.length > 0 && screenshotFiles.length === 0 && (
                    <div className="mt-2 text-[11px] text-success flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {existingSubmission.screenshots.length} screenshots previously uploaded
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-[var(--radius-md)] bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-sm transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
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
