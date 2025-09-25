// prioritize-tasks.ts
'use server';
/**
 * @fileOverview AI-powered task prioritization flow.
 *
 * - prioritizeTasks - A function that prioritizes tasks based on urgency and importance.
 * - PrioritizeTasksInput - The input type for the prioritizeTasks function, an array of tasks.
 * - PrioritizeTasksOutput - The return type for the prioritizeTasks function, an array of prioritized tasks.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PrioritizeTasksInputSchema = z.array(
  z.object({
    task: z.string().describe('The task to be prioritized.'),
  })
).describe('An array of tasks to prioritize.');

export type PrioritizeTasksInput = z.infer<typeof PrioritizeTasksInputSchema>;

const PrioritizeTasksOutputSchema = z.array(
  z.object({
    task: z.string().describe('The task.'),
    priority: z.string().describe('The priority of the task (High, Medium, Low).'),
    urgency: z.string().describe('The urgency of the task (Urgent, Not Urgent).'),
    reason: z.string().describe('The reason for the assigned priority and urgency.'),
  })
).describe('An array of prioritized tasks with their priority, urgency, and reasoning.');

export type PrioritizeTasksOutput = z.infer<typeof PrioritizeTasksOutputSchema>;

export async function prioritizeTasks(input: PrioritizeTasksInput): Promise<PrioritizeTasksOutput> {
  return prioritizeTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'prioritizeTasksPrompt',
  input: {schema: PrioritizeTasksInputSchema},
  output: {schema: PrioritizeTasksOutputSchema},
  prompt: `You are an AI assistant designed to prioritize a list of tasks based on their urgency and importance for business scaling and personal growth.

Given the following list of tasks:

{{#each input}}
- {{{this.task}}}
{{/each}}

Prioritize each task and provide a priority (High, Medium, Low), an urgency (Urgent, Not Urgent), and a brief explanation for your assessment.

Ensure the output is a JSON array of objects, where each object contains the task, priority, urgency, and reason fields.
`,
});

const prioritizeTasksFlow = ai.defineFlow(
  {
    name: 'prioritizeTasksFlow',
    inputSchema: PrioritizeTasksInputSchema,
    outputSchema: PrioritizeTasksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
