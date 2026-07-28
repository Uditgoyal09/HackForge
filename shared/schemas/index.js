import { z } from 'zod';

// Reusable enums matching Document 5
export const RoleEnum = z.enum(['admin', 'organizer', 'judge', 'participant']);
export const HackathonStatusEnum = z.enum(['draft', 'published', 'registration_open', 'registration_closed', 'submissions_open', 'judging', 'completed']);
export const RegistrationStatusEnum = z.enum(['pending', 'approved', 'rejected', 'cancelled']);
export const SubmissionStatusEnum = z.enum(['draft', 'submitted', 'under_review', 'approved', 'rejected']);

// 1. User Schema
export const UserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").regex(/\d/, "Password must contain at least one number").optional(), // optional for updates
  role: RoleEnum.default('participant'),
  isVerified: z.boolean().default(false),
  isBlocked: z.boolean().default(false),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  bio: z.string().max(500).optional().or(z.literal('')),
  skills: z.array(z.string()).default([]),
  githubUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
  conflictsOfInterest: z.array(z.string()).default([]), // judge only
});

export const SignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").regex(/\d/, "Password must contain at least one number"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});

// 2. Hackathon Schema
export const HackathonSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(10, "Description required"),
  theme: z.array(z.string()).default([]),
  mode: z.enum(['online', 'offline', 'hybrid']),
  venue: z.string().optional().or(z.literal('')),
  bannerUrl: z.string().url().optional().or(z.literal('')),
  registrationDeadline: z.string().datetime(),
  submissionStart: z.string().datetime(),
  submissionDeadline: z.string().datetime(),
  reviewDeadline: z.string().datetime(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  prizePool: z.number().min(0).default(0),
  maxTeamSize: z.number().int().min(1).max(10).default(4),
  rules: z.string().optional(),
  judgingCriteria: z.array(z.string()).default([]),
  status: HackathonStatusEnum.default('draft')
});

// 3. Team Schema
export const TeamSchema = z.object({
  name: z.string().min(3).max(40),
  description: z.string().max(500).optional().or(z.literal(''))
});

// 4. Submission Schema
export const SubmissionSchema = z.object({
  projectName: z.string().min(2).max(100),
  problemStatement: z.string().min(10),
  solution: z.string().min(10),
  description: z.string().min(10),
  githubUrl: z.string().url(),
  liveDemoUrl: z.string().url().optional().or(z.literal('')),
  techStack: z.array(z.string()).default([]),
  screenshotUrls: z.array(z.string().url()).max(6).default([]),
  presentationUrl: z.string().url().optional().or(z.literal('')),
  demoVideoUrl: z.string().url().optional().or(z.literal(''))
});

// 5. Review Schema
export const ReviewSchema = z.object({
  scores: z.object({
    innovation: z.number().int().min(1).max(10),
    technicalComplexity: z.number().int().min(1).max(10),
    ui: z.number().int().min(1).max(10),
    functionality: z.number().int().min(1).max(10),
    scalability: z.number().int().min(1).max(10),
    documentation: z.number().int().min(1).max(10),
    presentation: z.number().int().min(1).max(10)
  }),
  feedback: z.string().min(20, "Feedback must be at least 20 characters")
});
