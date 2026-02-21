const { z } = require('zod');

const setupProfileSchema = z.object({
  educationLevel: z.string().min(1, "Education level is required"),
  currentCourse: z.string().min(1, "Current course is required"),
  yearOfStudy: z.string().optional(),
  dailyStudyHours: z
    .number()
    .min(0, "Study hours cannot be negative")
    .max(24, "Study hours cannot exceed 24")
    .optional(),
  careerInterests: z
    .array(z.string())
    .min(1, "Select at least one career interest")
    .optional(),
});

const updateProfileSchema = setupProfileSchema.partial();

module.exports = {
  setupProfileSchema,
  updateProfileSchema,
};