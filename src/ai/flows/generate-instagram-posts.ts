'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating Instagram posts.
 *
 * - generateInstagramPosts - A function that generates Instagram posts.
 * - GenerateInstagramPostsInput - The input type for the generateInstagramPosts function.
 * - GenerateInstagramPostsOutput - The return type for the generateInstagramPosts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInstagramPostsInputSchema = z.object({
  businessDescription: z
    .string()
    .describe('The description of the business for which to generate Instagram posts.'),
  targetAudience: z.string().describe('The target audience of the Instagram posts.'),
  promotionDetails: z
    .string()
    .optional()
    .describe('Optional details about a specific promotion to include in the posts.'),
  numberOfPosts: z
    .number()
    .default(3)
    .describe('The number of Instagram posts to generate.'),
});
export type GenerateInstagramPostsInput = z.infer<typeof GenerateInstagramPostsInputSchema>;

const GenerateInstagramPostsOutputSchema = z.object({
  posts: z.array(z.string()).describe('An array of generated Instagram posts.'),
});
export type GenerateInstagramPostsOutput = z.infer<typeof GenerateInstagramPostsOutputSchema>;

export async function generateInstagramPosts(input: GenerateInstagramPostsInput): Promise<GenerateInstagramPostsOutput> {
  return generateInstagramPostsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInstagramPostsPrompt',
  input: {schema: GenerateInstagramPostsInputSchema},
  output: {schema: GenerateInstagramPostsOutputSchema},
  prompt: `You are a social media expert specializing in creating engaging Instagram posts.

You will generate {{numberOfPosts}} Instagram posts for a business with the following description:
{{{businessDescription}}}

The target audience for these posts is:
{{{targetAudience}}}

{{#if promotionDetails}}
Include the following promotion details in the posts:
{{{promotionDetails}}}
{{/if}}

The posts should be engaging, informative, and tailored to the target audience.
Ensure each post is unique and provides value to the followers.
Each post should be around 200 characters.

Output the post as a numbered list.
`, 
});

const generateInstagramPostsFlow = ai.defineFlow(
  {
    name: 'generateInstagramPostsFlow',
    inputSchema: GenerateInstagramPostsInputSchema,
    outputSchema: GenerateInstagramPostsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    //splitting the output by the new line and removing the numbers from each line
    const posts = output!.posts;
    return {posts: posts!};
  }
);
