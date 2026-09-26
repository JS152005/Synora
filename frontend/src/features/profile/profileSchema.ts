import { z } from "zod";

export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Full name must be at least 3 characters.")
    .max(100, "Full name cannot exceed 100 characters."),

  bio: z
    .string()
    .trim()
    .max(500, "Bio cannot exceed 500 characters."),

  college: z
    .string()
    .trim()
    .max(150, "College name cannot exceed 150 characters."),

  course: z
    .string()
    .trim()
    .max(100, "Course cannot exceed 100 characters."),

  year: z
    .string()
    .trim()
    .max(50, "Academic year cannot exceed 50 characters."),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
