import React from 'react';

const phases = [
  { id: 'registration', label: 'Registration' },
  { id: 'team', label: 'Team Formation' },
  { id: 'submission', label: 'Submission' },
  { id: 'judging', label: 'Judging' },
  { id: 'results', label: 'Results' }
];

const EventProgress = ({ hackathon }) => {
  const determineCurrentPhaseIndex = () => {
    if (hackathon.status === 'completed' || hackathon.resultsPublished) return 4;
    const now = new Date();
    if (hackathon.status === 'ongoing') return 3;
    if (new Date(hackathon.submissionDeadline) < now) return 3;
    if (new Date(hackathon.registrationDeadline) < now) return 2;
    if (hackathon.registrationStatus === 'open') return 0;
    return -1; // Draft or upcoming but closed
  };

  const currentIndex = determineCurrentPhaseIndex();

  return (
    <div className="w-full">
      <div className="flex justify-between relative mb-2">
        <div className="absolute top-1.5 left-0 w-full h-px bg-border z-0" />
        
        {phases.map((phase, i) => {
          const isCompleted = i < currentIndex;
          const isCurrent = i === currentIndex;

          return (
            <div key={phase.id} className="relative z-10 flex flex-col items-center">
              <div 
                className={`w-3 h-3 rounded-full border flex items-center justify-center mb-1 transition-all duration-500
                  ${isCompleted ? 'bg-primary border-primary text-primary-foreground' : 
                    isCurrent ? 'bg-foreground border-foreground shadow-[0_0_10px_rgba(255,255,255,0.2)] animate-pulse' : 
                    'bg-surface border-border'}`}
              >
                {isCompleted && (
                  <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[9px] font-semibold tracking-wider uppercase text-muted-foreground">
        {phases.map((phase, i) => (
          <span key={phase.id} className={i === currentIndex ? 'text-foreground' : ''}>
            {i === 0 || i === phases.length - 1 || i === currentIndex ? phase.label : ''}
          </span>
        ))}
      </div>
    </div>
  );
};

export default EventProgress;
