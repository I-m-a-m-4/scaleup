
'use server';
/**
 * @fileOverview An AI flow to generate a cheerful message for a completed task.
 *
 * - generateEncouragement - A function that returns a fun, encouraging message.
 * - GenerateEncouragementInput - The input type for the function.
 * - GenerateEncouragementOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEncouragementInputSchema = z.object({
  task: z.string().describe('The task that the user just completed.'),
});

export type GenerateEncouragementInput = z.infer<typeof GenerateEncouragementInputSchema>;

const GenerateEncouragementOutputSchema = z.object({
  encouragement: z.string().describe('A short, fun, encouraging message for the user.'),
});

export type GenerateEncouragementOutput = z.infer<typeof GenerateEncouragementOutputSchema>;

export async function generateEncouragement(input: GenerateEncouragementInput): Promise<GenerateEncouragementOutput> {
  return generateEncouragementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEncouragementPrompt',
  input: {schema: GenerateEncouragementInputSchema},
  output: {schema: GenerateEncouragementOutputSchema},
  prompt: `You are a fun, slightly quirky AI assistant. A user just completed a task.
Your job is to give them a short, encouraging, and slightly humorous message.
Keep it under 15 words. Use emojis.

The task was: "{{task}}"

Generate a response.
`,
});

const generateEncouragementFlow = ai.defineFlow(
  {
    name: 'generateEncouragementFlow',
    inputSchema: GenerateEncouragementInputSchema,
    outputSchema: GenerateEncouragementOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
