const { z } = require('zod');

const createTeamSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Team name must be at least 3 characters'),
  })
});

const inviteMemberSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').optional(),
    invitedEmail: z.string().email('Invalid email address').optional(),
  }).refine(data => data.email || data.invitedEmail, {
    message: 'Email or invitedEmail is required',
    path: ['email']
  })
});

module.exports = {
  createTeamSchema,
  inviteMemberSchema,
};
