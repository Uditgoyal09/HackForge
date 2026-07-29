import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, Trophy, Calendar } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { hackathonService } from '../../services/hackathonService';
import { toast } from 'sonner';

const CreateHackathon = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mode: 'online',
    venue: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    submissionDeadline: '',
    prizePool: 10000,
    maxTeamSize: 4,
    rules: '',
  });

  // Dynamic Judging Criteria State
  const [criteria, setCriteria] = useState([
    { name: 'Innovation', description: 'Novelty of problem statement and solution', maxScore: 50 },
    { name: 'Technical Execution', description: 'Quality of code and architecture', maxScore: 50 },
  ]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddCriterion = () => {
    setCriteria([...criteria, { name: '', description: '', maxScore: 10 }]);
  };

  const handleRemoveCriterion = (index) => {
    setCriteria(criteria.filter((_, i) => i !== index));
  };

  const handleCriterionChange = (index, field, value) => {
    const next = [...criteria];
    next[index][field] = value;
    setCriteria(next);
  };

  const handleNext = () => {
    if (step === 1 && (!formData.title || !formData.description)) {
      toast.error('Please enter title and description');
      return;
    }
    if (step === 2 && (!formData.startDate || !formData.endDate || !formData.registrationDeadline || !formData.submissionDeadline)) {
      toast.error('Please complete all timeline dates');
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (criteria.length === 0) {
      toast.error('Add at least one judging criterion');
      return;
    }

    const payload = {
      ...formData,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : '',
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : '',
      registrationDeadline: formData.registrationDeadline ? new Date(formData.registrationDeadline).toISOString() : '',
      submissionDeadline: formData.submissionDeadline ? new Date(formData.submissionDeadline).toISOString() : '',
      prizePool: Number(formData.prizePool) || 0,
      maxTeamSize: Number(formData.maxTeamSize) || 4,
      judgingCriteria: criteria.map(c => ({ name: c.name, description: c.description || '', maxScore: Number(c.maxScore) || 10 })),
    };

    setSubmitting(true);
    try {
      const res = await hackathonService.createHackathon(payload);
      if (res.success) {
        toast.success('Hackathon created successfully!');
        navigate('/organizer/dashboard');
      }
    } catch (err) {
      const errorResponse = err.response?.data;
      let errorMsg = 'Failed to create hackathon';
      if (Array.isArray(errorResponse?.errors) && errorResponse.errors.length > 0) {
        errorMsg = errorResponse.errors.map(e => e.message || e.field).join(', ');
      } else if (errorResponse?.message) {
        errorMsg = errorResponse.message;
      } else if (err.message) {
        errorMsg = err.message;
      }
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <PageHeader 
          showBack 
          title="Create New Hackathon" 
          description="Multi-step wizard to setup event details, deadlines, and criteria."
          unsavedChanges={step > 1}
        />

        {/* Wizard Steps Progress */}
        <div className="grid grid-cols-6 gap-2 mb-10 text-center text-xs">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className={`p-2.5 rounded-[var(--radius-md)] border transition-all ${
                step === i
                  ? 'bg-primary text-primary-foreground font-bold border-primary shadow-md shadow-primary/20'
                  : step > i
                  ? 'bg-success/20 text-success border-success/30'
                  : 'bg-surface border-border text-muted-foreground'
              }`}
            >
              Step {i}
            </div>
          ))}
        </div>

        {/* Form Container */}
        <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 sm:p-10">
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-foreground mb-4">Step 1: Event Details</h3>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Hackathon Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. AI Agents Global Hackathon"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-[var(--radius-md)] text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Description & Objective</label>
                <textarea
                  rows={4}
                  name="description"
                  required
                  placeholder="Explain the theme, challenge, and goals..."
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-[var(--radius-md)] text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Event Mode</label>
                <select
                  name="mode"
                  value={formData.mode}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-[var(--radius-md)] text-sm text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline / In-Person</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 2: Timeline */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-foreground mb-4">Step 2: Schedule & Deadlines</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Registration Deadline</label>
                  <input
                    type="datetime-local"
                    name="registrationDeadline"
                    value={formData.registrationDeadline}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-background border border-input rounded-[var(--radius-md)] text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Event Start Date</label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-background border border-input rounded-[var(--radius-md)] text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Submission Deadline</label>
                  <input
                    type="datetime-local"
                    name="submissionDeadline"
                    value={formData.submissionDeadline}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-background border border-input rounded-[var(--radius-md)] text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Event End Date</label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-background border border-input rounded-[var(--radius-md)] text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Participation */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-foreground mb-4">Step 3: Prize Pool & Team Size</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Prize Pool ($ USD)</label>
                  <input
                    type="number"
                    name="prizePool"
                    value={formData.prizePool}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-background border border-input rounded-[var(--radius-md)] text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Maximum Team Size</label>
                  <input
                    type="number"
                    name="maxTeamSize"
                    min={1}
                    max={10}
                    value={formData.maxTeamSize}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-background border border-input rounded-[var(--radius-md)] text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Judging Criteria */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-foreground">Step 4: Dynamic Judging Criteria</h3>
                <button
                  type="button"
                  onClick={handleAddCriterion}
                  className="px-3 py-1.5 rounded-[var(--radius-md)] bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Criterion
                </button>
              </div>

              <div className="space-y-3">
                {criteria.map((c, i) => (
                  <div key={i} className="p-4 rounded-[var(--radius-md)] bg-background border border-border space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        placeholder="Criterion Name (e.g. Innovation)"
                        value={c.name}
                        onChange={(e) => handleCriterionChange(i, 'name', e.target.value)}
                        className="flex-1 px-3 py-2 bg-surface border border-input rounded-[var(--radius-md)] text-xs text-foreground"
                      />
                      <input
                        type="number"
                        placeholder="Max Score"
                        value={c.maxScore}
                        onChange={(e) => handleCriterionChange(i, 'maxScore', e.target.value)}
                        className="w-24 px-3 py-2 bg-surface border border-input rounded-[var(--radius-md)] text-xs text-foreground"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveCriterion(i)}
                        className="p-2 text-muted-foreground hover:text-error"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Criterion Description"
                      value={c.description}
                      onChange={(e) => handleCriterionChange(i, 'description', e.target.value)}
                      className="w-full px-3 py-2 bg-surface border border-input rounded-[var(--radius-md)] text-xs text-foreground"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Rules */}
          {step === 5 && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-foreground mb-4">Step 5: Code of Conduct & Rules</h3>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Rules & Guidelines</label>
                <textarea
                  rows={5}
                  name="rules"
                  placeholder="Specify submission rules, code of conduct, plagiarism policies..."
                  value={formData.rules}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-[var(--radius-md)] text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          )}

          {/* STEP 6: Review & Publish */}
          {step === 6 && (
            <div className="space-y-4 text-xs">
              <h3 className="font-bold text-lg text-foreground mb-4">Step 6: Review Event Summary</h3>

              <div className="p-4 rounded-[var(--radius-md)] bg-background border border-border space-y-2">
                <p className="font-bold text-sm text-foreground">{formData.title}</p>
                <p className="text-muted-foreground">{formData.description}</p>
                <p className="text-primary font-semibold">Prize Pool: ${formData.prizePool?.toLocaleString()} • Max Team: {formData.maxTeamSize}</p>
              </div>

              <div className="p-4 rounded-[var(--radius-md)] bg-background border border-border">
                <p className="font-semibold text-foreground mb-2">Configured Judging Criteria ({criteria.length})</p>
                <ul className="list-disc list-inside text-muted-foreground">
                  {criteria.map((c, i) => (
                    <li key={i}>{c.name} ({c.maxScore} Pts)</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Wizard Controls */}
          <div className="flex items-center justify-between pt-8 border-t border-border mt-8">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-2.5 rounded-[var(--radius-md)] bg-surface border border-border text-foreground text-xs font-semibold hover:bg-surface-hover flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : <div />}

            {step < 6 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-[var(--radius-md)] bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-primary/25"
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-8 py-3 rounded-[var(--radius-md)] bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Publish Hackathon'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateHackathon;
