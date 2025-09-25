// src/ai/flows/generate-faq-chatbot-responses.ts
'use server';

/**
 * @fileOverview A flow to generate responses to frequently asked questions for a chatbot.
 *
 * - generateFAQChatbotResponses - A function that generates chatbot responses for FAQs.
 * - GenerateFAQChatbotResponsesInput - The input type for the generateFAQChatbotResponses function.
 * - GenerateFAQChatbotResponsesOutput - The return type for the generateFAQChatbotResponses function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFAQChatbotResponsesInputSchema = z.object({
  faqList: z
    .string()
    .describe('A list of frequently asked questions.'),
  context: z.string().describe('Relevant context for generating the FAQ responses.'),
});

export type GenerateFAQChatbotResponsesInput = z.infer<
  typeof GenerateFAQChatbotResponsesInputSchema
>;

const GenerateFAQChatbotResponsesOutputSchema = z.object({
  responses: z.string().describe('The generated chatbot responses for the FAQs.'),
});

export type GenerateFAQChatbotResponsesOutput = z.infer<
  typeof GenerateFAQChatbotResponsesOutputSchema
>;

export async function generateFAQChatbotResponses(
  input: GenerateFAQChatbotResponsesInput
): Promise<GenerateFAQChatbotResponsesOutput> {
  return generateFAQChatbotResponsesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFAQChatbotResponsesPrompt',
  input: {schema: GenerateFAQChatbotResponsesInputSchema},
  output: {schema: GenerateFAQChatbotResponsesOutputSchema},
  prompt: `You are an expert chatbot response generator.

  Given the following context:
  {{context}}

  Generate chatbot responses for the following frequently asked questions:
  {{faqList}}

  Make sure the responses are clear, concise, and helpful.
  Return the responses as a single string.
  `,
});

const generateFAQChatbotResponsesFlow = ai.defineFlow(
  {
    name: 'generateFAQChatbotResponsesFlow',
    inputSchema: GenerateFAQChatbotResponsesInputSchema,
    outputSchema: GenerateFAQChatbotResponsesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
