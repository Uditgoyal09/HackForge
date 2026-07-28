const { z } = require('zod');

const submitReviewSchema = z.object({
  body: z.object({
    criteriaScores: z.array(z.object({
      criterionName: z.string().min(1, 'Criterion name is required'),
      score: z.number().min(0, 'Score cannot be negative'),
    })).min(1, 'At least one criterion score is required'),
    feedback: z.string().optional(),
    status: z.enum(['draft', 'submitted']).default('draft'),
  })
});

module.exports = {
  submitReviewSchema,
};
