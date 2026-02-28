import { z } from "zod";

// Contact form validation schema
export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name must be less than 100 characters" })
    .regex(/^[a-zA-Z\s'-]+$/, { message: "Name can only contain letters, spaces, hyphens, and apostrophes" }),
  
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address" })
    .max(255, { message: "Email must be less than 255 characters" })
    .toLowerCase(),
  
  phone: z
    .string()
    .trim()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .max(20, { message: "Phone number must be less than 20 characters" })
    .regex(/^[\d\s()+-]+$/, { message: "Phone number can only contain numbers, spaces, parentheses, hyphens, and plus signs" }),
  
  address: z
    .string()
    .trim()
    .min(5, { message: "Address must be at least 5 characters" })
    .max(300, { message: "Address must be less than 300 characters" }),
  
  message: z
    .string()
    .trim()
    .min(10, { message: "Message must be at least 10 characters" })
    .max(2000, { message: "Message must be less than 2000 characters" })
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// Sanitize string to prevent XSS
export const sanitizeString = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .trim();
};

// Validate and sanitize contact form data
export const validateContactForm = (data: ContactFormData) => {
  try {
    const validated = contactFormSchema.parse(data);
    
    // Additional sanitization
    return {
      name: sanitizeString(validated.name),
      email: sanitizeString(validated.email),
      phone: sanitizeString(validated.phone),
      address: sanitizeString(validated.address),
      message: sanitizeString(validated.message)
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0].message);
    }
    throw error;
  }
};
