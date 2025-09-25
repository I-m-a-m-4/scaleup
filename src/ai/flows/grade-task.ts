'use server';
/**
 * @fileOverview An AI flow to grade a task and provide a score.
 *
 * - gradeTask - A function that grades a task based on its complexity and importance.
 * - GradeTaskInput - The input type for the gradeTask function.
 * - GradeTaskOutput - The return type for the gradeTask function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GradeTaskInputSchema = z.object({
  task: z.string().describe('The task to be graded.'),
});

export type GradeTaskInput = z.infer<typeof GradeTaskInputSchema>;

const GradeTaskOutputSchema = z.object({
  score: z.number().describe('A score from 1 to 100 representing the payload power of the task.'),
  reasoning: z.string().describe('A brief explanation for the assigned score.'),
});

export type GradeTaskOutput = z.infer<typeof GradeTaskOutputSchema>;

export async function gradeTask(input: GradeTaskInput): Promise<GradeTaskOutput> {
  return gradeTaskFlow(input);
}

const prompt = ai.definePrompt({
  name: 'gradeTaskPrompt',
  input: {schema: GradeTaskInputSchema},
  output: {schema: GradeTaskOutputSchema},
  prompt: `You are an AI that grades the "payload power" of a task for a gamified productivity app.
The user is building a rocket, and each completed task is a payload.
Your job is to assign a score from 1 to 100 based on the task's complexity, effort, and importance towards personal or professional growth.

- Simple, quick tasks (e.g., "Answer emails") should get a low score (1-20).
- Moderately complex tasks (e.g., "Write a blog post draft") should get a medium score (21-60).
- Highly complex, impactful tasks (e.g., "Develop a new feature for the app" or "Create a business plan") should get a high score (61-100).

Task to grade:
"{{{task}}}"

Provide a score and a very brief, encouraging reasoning.
`,
});

const gradeTaskFlow = ai.defineFlow(
  {
    name: 'gradeTaskFlow',
    inputSchema: GradeTaskInputSchema,
    outputSchema: GradeTaskOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
