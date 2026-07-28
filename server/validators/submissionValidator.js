const { z } = require('zod');

const submitProjectSchema = z.object({
  body: z.object({
    projectName: z.string().min(3, 'Project name must be at least 3 characters'),
    problemStatement: z.string().min(10, 'Problem statement is required'),
    solution: z.string().min(10, 'Solution is required'),
    description: z.string().optional(),
    githubRepository: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
    liveDemo: z.string().url('Invalid Live Demo URL').optional().or(z.literal('')),
    demoVideo: z.string().url('Invalid Video URL').optional().or(z.literal('')),
    techStack: z.union([z.array(z.string()), z.string()]).optional(),
  })
});

const updateProjectSchema = z.object({
  body: z.object({
    projectName: z.string().min(3).optional(),
    problemStatement: z.string().min(10).optional(),
    solution: z.string().min(10).optional(),
    description: z.string().optional(),
    githubRepository: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
    liveDemo: z.string().url('Invalid Live Demo URL').optional().or(z.literal('')),
    demoVideo: z.string().url('Invalid Video URL').optional().or(z.literal('')),
    techStack: z.union([z.array(z.string()), z.string()]).optional(),
  })
});

module.exports = {
  submitProjectSchema,
  updateProjectSchema,
};
