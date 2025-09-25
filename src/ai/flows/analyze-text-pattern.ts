'use server';
/**
 * @fileOverview An AI flow to analyze text for patterns and insights.
 *
 * - analyzeTextPattern - A function that analyzes a user's text.
 * - AnalyzeTextPatternInput - The input type for the function.
 * - AnalyzeTextPatternOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeTextPatternInputSchema = z.object({
  text: z.string().describe('The user\'s text to analyze.'),
});

export type AnalyzeTextPatternInput = z.infer<typeof AnalyzeTextPatternInputSchema>;

const AnalyzeTextPatternOutputSchema = z.object({
  analysis: z.string().describe('A summary of patterns, themes, or insights found in the text.'),
});

export type AnalyzeTextPatternOutput = z.infer<typeof AnalyzeTextPatternOutputSchema>;

export async function analyzeTextPattern(input: AnalyzeTextPatternInput): Promise<AnalyzeTextPatternOutput> {
  return analyzeTextPatternFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeTextPatternPrompt',
  input: {schema: AnalyzeTextPatternInputSchema},
  output: {schema: AnalyzeTextPatternOutputSchema},
  prompt: `You are an insightful AI assistant. Analyze the following text written by a user in their personal editor.
Identify recurring themes, topics, tasks, or any interesting patterns.
Provide a short, bulleted summary of your findings. Be encouraging and helpful.

Text to analyze:
"{{{text}}}"

Generate the analysis.
`,
});

const analyzeTextPatternFlow = ai.defineFlow(
  {
    name: 'analyzeTextPatternFlow',
    inputSchema: AnalyzeTextPatternInputSchema,
    outputSchema: AnalyzeTextPatternOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
