const { z } = require('zod');

/*
  Utility to clean and normalize skillRatings safely.
  - Removes invalid keys
  - Converts strings → numbers
  - Drops NaN values
*/
const skillRatingsSchema = z.preprocess((val) => {
  if (!val || typeof val !== 'object' || Array.isArray(val)) {
    return undefined;
  }

  const cleaned = {};

  for (const [key, value] of Object.entries(val)) {
    let num;

    if (typeof value === 'number' && Number.isFinite(value)) {
      num = value;
    } else if (typeof value === 'string') {
      const cleanedStr = value.replace(/[^0-9.\-]/g, '').trim();
      if (cleanedStr !== '') {
        const parsed = Number(cleanedStr);
        if (!Number.isNaN(parsed) && Number.isFinite(parsed)) num = parsed;
      }
    } else if (value && typeof value === 'object') {
      // handle cases like { value: '25' } or { v: '25' }
      const candidate = value.value ?? value.v ?? value.score ?? value.level;
      if (candidate !== undefined) {
        const cs = String(candidate).replace(/[^0-9.\-]/g, '').trim();
        if (cs !== '') {
          const parsed = Number(cs);
          if (!Number.isNaN(parsed) && Number.isFinite(parsed)) num = parsed;
        }
      }
    }

    if (typeof num === 'number' && Number.isFinite(num)) {
      cleaned[key.toLowerCase().trim()] = num;
    }
  }

  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
},
// Accept flexible inputs (strings/numbers/objects). We'll normalize in the controller.
z.record(z.any())).optional();



const setupProfileSchema = z.object({
  educationLevel: z
    .string()
    .min(1, "Education level is required"),

  currentCourse: z
    .string()
    .optional()
    .default(''),

  yearOfStudy: z
    .string()
    .optional(),

  // Safely coerce study hours
  dailyStudyHours: z
    .coerce
    .number()
    .min(0, "Study hours cannot be negative")
    .max(24, "Study hours cannot exceed 24")
    .optional(),

  dailyAvailableHours: z
    .coerce
    .number()
    .min(0, "Available hours cannot be negative")
    .max(24, "Available hours cannot exceed 24")
    .optional(),

  // Required during onboarding
  careerInterests: z
    .array(z.string())
    .min(1, "Select at least one career interest"),

  // Accept any shape for skillRatings and normalize in controller to avoid zod internals errors
  skillRatings: z.any().optional(),

  resumeSkills: z
    .array(z.string())
    .optional(),

  resumeExperience: z
    .array(z.string())
    .optional(),

  hasOnboarded: z
    .boolean()
    .optional(),

  hasCompletedQuiz: z
    .boolean()
    .optional(),

  resumeText: z
    .string()
    .max(50000, "Resume text too long")
    .optional(),
});



const updateProfileSchema = setupProfileSchema.partial();



module.exports = {
  setupProfileSchema,
  updateProfileSchema,
};