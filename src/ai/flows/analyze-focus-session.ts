'use server';

/**
 * @fileOverview A Genkit flow to analyze a user's focus during a session using webcam frames.
 * - analyzeFocusSession - A function that processes video frames to determine user presence.
 */

import {ai} from '@/ai/genkit';
import type { AnalyzeFocusSessionInput, AnalyzeFocusSessionOutput } from './schemas';
import { AnalyzeFocusSessionInputSchema, AnalyzeFocusSessionOutputSchema } from './schemas';


export async function analyzeFocusSession(input: AnalyzeFocusSessionInput): Promise<AnalyzeFocusSessionOutput> {
    return analyzeFocusSessionFlow(input);
}


const prompt = ai.definePrompt({
    name: 'analyzeFocusSessionPrompt',
    input: {schema: AnalyzeFocusSessionInputSchema},
    output: {schema: AnalyzeFocusSessionOutputSchema},
    prompt: `You are an AI assistant helping a user stay focused. Analyze this image from their webcam.
    
    Image: {{media url=imageDataUri}}
    
    Determine if a person is present and appears to be at their desk.
    - If a person is clearly visible and facing the screen, set isUserPresent to true and provide positive feedback like "Great focus!".
    - If no person is visible, set isUserPresent to false and provide feedback like "Are you still there? Take a break if you need to."
    - If a person is visible but looking away or distracted, set isUserPresent to true but provide gentle feedback like "Let's get back to it!".
    `,
});

const analyzeFocusSessionFlow = ai.defineFlow(
  {
    name: 'analyzeFocusSessionFlow',
    inputSchema: AnalyzeFocusSessionInputSchema,
    outputSchema: AnalyzeFocusSessionOutputSchema,
  },
  async (input) => {
    // In a real application, you would implement logic to either use a more complex model
    // or simply return a mock response for UI development. For now, we'll simulate a positive result.
    console.log("Analyzing frame (simulation)...");

    // This is a placeholder. A real implementation would call a vision model.
    // const { output } = await prompt(input);
    // return output!;

    return {
        isUserPresent: true,
        feedback: "You're doing great! Keep up the focus."
    }
  }
);
