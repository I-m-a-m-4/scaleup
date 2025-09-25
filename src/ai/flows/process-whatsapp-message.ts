'use server';
/**
 * @fileOverview A Genkit flow to process incoming messages from a WhatsApp bot.
 * This flow interprets user commands and can interact with Aivo features, like creating tasks.
 *
 * - processWhatsAppMessage - The main function to handle incoming WhatsApp messages.
 * - ProcessWhatsAppMessageInput - The input type for the flow.
 * - ProcessWhatsAppMessageOutput - The return type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {collection, addDoc} from 'firebase/firestore';
import {db} from '@/lib/firebase';

// Define a tool for creating tasks. The AI will learn to call this function.
const createTaskTool = ai.defineTool(
  {
    name: 'createTask',
    description: 'Use this tool to create a new task for the user.',
    inputSchema: z.object({
      taskDescription: z.string().describe('The detailed description of the task to be created.'),
      userId: z.string().describe("The user's unique ID."),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
  async ({taskDescription, userId}) => {
    if (!db) {
      return {success: false, message: 'Database is not configured.'};
    }
    try {
      await addDoc(collection(db, 'tasks'), {
        task: taskDescription,
        completed: false,
        userId: userId,
        createdAt: new Date(),
      });
      return {success: true, message: `Task '${taskDescription}' was created successfully.`};
    } catch (error) {
      console.error('Error creating task from tool:', error);
      return {success: false, message: 'I was unable to create the task due to an internal error.'};
    }
  }
);

// Define the input schema for the main flow
export const ProcessWhatsAppMessageInputSchema = z.object({
  message: z.string().describe('The message content from the user on WhatsApp.'),
  userId: z.string().describe("The Aivo user's unique ID, linked to their WhatsApp number."),
});
export type ProcessWhatsAppMessageInput = z.infer<typeof ProcessWhatsAppMessageInputSchema>;

// Define the output schema for the main flow
export const ProcessWhatsAppMessageOutputSchema = z.object({
  response: z.string().describe('The conversational response to send back to the user.'),
});
export type ProcessWhatsAppMessageOutput = z.infer<typeof ProcessWhatsAppMessageOutputSchema>;

// Define the prompt that uses the tool
const whatsAppBotPrompt = ai.definePrompt({
  name: 'whatsAppBotPrompt',
  tools: [createTaskTool],
  system: `You are Aivo, a friendly and helpful AI assistant communicating with a user via WhatsApp.
  Your goal is to help the user manage their tasks.
  If the user asks to create a task, use the createTask tool.
  If the user asks a question, answer it concisely.
  Keep your responses short and conversational, suitable for a chat app.`,
});

// The main flow function
const processWhatsAppMessageFlow = ai.defineFlow(
  {
    name: 'processWhatsAppMessageFlow',
    inputSchema: ProcessWhatsAppMessageInputSchema,
    outputSchema: ProcessWhatsAppMessageOutputSchema,
  },
  async ({message, userId}) => {
    // We need to pass the userId to the tool, so we'll wrap the prompt call
    const result = await whatsAppBotPrompt({
      prompt: message,
      context: {
        userId: userId, // Pass userId to the context for the tool to use
      },
    });

    return {response: result.text};
  }
);

// Exported wrapper function to be called by your WhatsApp bot backend
export async function processWhatsAppMessage(
  input: ProcessWhatsAppMessageInput
): Promise<ProcessWhatsAppMessageOutput> {
  return processWhatsAppMessageFlow(input);
}
