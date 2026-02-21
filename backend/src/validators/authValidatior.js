const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100),
});


const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});


const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});


const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100),
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};