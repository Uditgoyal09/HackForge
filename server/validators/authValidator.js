const { z } = require('zod');

const signupSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters long').max(50),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    // Note: 'role' is intentionally omitted to prevent mass-assignment
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  })
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters long'),
  })
});

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50).optional(),
    bio: z.string().max(500).optional(),
    skills: z.array(z.string()).optional(),
    github: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
    linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
    portfolio: z.string().url('Invalid Portfolio URL').optional().or(z.literal('')),
    college: z.string().max(100).optional(),
  })
});

module.exports = {
  signupSchema,
  loginSchema,
  changePasswordSchema,
  updateProfileSchema,
};
