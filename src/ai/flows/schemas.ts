import {z} from 'genkit';

/**
 * @fileOverview This file contains the Zod schemas and TypeScript types for Genkit flows.
 * By centralizing schemas here, we can avoid "use server" directive conflicts.
 */

// Schema for analyze-focus-session.ts
export const AnalyzeFocusSessionInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A single frame from a video feed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeFocusSessionInput = z.infer<typeof AnalyzeFocusSessionInputSchema>;

export const AnalyzeFocusSessionOutputSchema = z.object({
  isUserPresent: z.boolean().describe('Whether or not a person is detected in the frame.'),
  feedback: z.string().describe('A short feedback message for the user, e.g., "Looking good!" or "Are you there?".'),
});
export type AnalyzeFocusSessionOutput = z.infer<typeof AnalyzeFocusSessionOutputSchema>;

// Schema for process-whatsapp-message.ts
export const ProcessWhatsAppMessageInputSchema = z.object({
  message: z.string().describe('The message content from the user on WhatsApp.'),
  userId: z.string().describe("The Aivo user's unique ID, linked to their WhatsApp number."),
});
export type ProcessWhatsAppMessageInput = z.infer<typeof ProcessWhatsAppMessageInputSchema>;

export const ProcessWhatsAppMessageOutputSchema = z.object({
  response: z.string().describe('The conversational response to send back to the user.'),
});
export type ProcessWhatsAppMessageOutput = z.infer<typeof ProcessWhatsAppMessageOutputSchema>;
