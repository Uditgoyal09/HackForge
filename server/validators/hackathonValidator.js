const { z } = require('zod');

const hackathonCriteriaSchema = z.object({
  name: z.string().min(1, 'Criterion name is required'),
  description: z.string().optional(),
  maxScore: z.number().min(1, 'Max score must be at least 1'),
});

const createHackathonSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description is required'),
    theme: z.string().optional(),
    mode: z.enum(['online', 'offline']),
    venue: z.string().optional(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    registrationDeadline: z.string().datetime(),
    submissionDeadline: z.string().datetime(),
    prizePool: z.number().min(0).default(0),
    maxTeamSize: z.number().min(1).default(4),
    rules: z.string().optional(),
    judgingCriteria: z.array(hackathonCriteriaSchema).optional(),
    // Exclude 'organizer', 'status', 'registrationStatus', 'resultsPublished' 
    // to prevent mass assignment.
  }).refine((data) => new Date(data.registrationDeadline) < new Date(data.startDate), {
    message: 'Registration deadline must be before start date',
    path: ['registrationDeadline'],
  }).refine((data) => new Date(data.startDate) <= new Date(data.submissionDeadline), {
    message: 'Start date must be before or equal to submission deadline',
    path: ['submissionDeadline'],
  }).refine((data) => new Date(data.submissionDeadline) <= new Date(data.endDate), {
    message: 'Submission deadline must be before or equal to end date',
    path: ['submissionDeadline'],
  })
});

const updateHackathonSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    theme: z.string().optional(),
    mode: z.enum(['online', 'offline']).optional(),
    venue: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    registrationDeadline: z.string().datetime().optional(),
    submissionDeadline: z.string().datetime().optional(),
    prizePool: z.number().min(0).optional(),
    maxTeamSize: z.number().min(1).optional(),
    rules: z.string().optional(),
    judgingCriteria: z.array(hackathonCriteriaSchema).optional(),
  })
  // Refinements on optional fields can be tricky; ideally checked in the controller if updating dates.
});

module.exports = {
  createHackathonSchema,
  updateHackathonSchema,
};
