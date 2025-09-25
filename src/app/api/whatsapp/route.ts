// src/app/api/whatsapp/route.ts
import { NextResponse } from 'next/server';
import { processWhatsAppMessage } from '@/ai/flows/process-whatsapp-message';

// This is your webhook's secret token.
// It should be set in your environment variables and be a long, random string.
// You'll provide this to WAHA to secure your webhook.
const WEBHOOK_TOKEN = process.env.WAHA_WEBHOOK_TOKEN;

// This is the main handler for incoming WhatsApp messages from WAHA
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Basic security check to ensure the request is from WAHA
    // In a real production environment, you'd have more robust signature validation
    const token = request.headers.get('x-webhook-token');
    if (WEBHOOK_TOKEN && token !== WEBHOOK_TOKEN) {
      console.warn('Invalid webhook token received.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // We only care about new text messages for now
    if (body.event === 'message' && body.payload?.body) {
      const message = body.payload.body;
      const from = body.payload.from; // This is the user's WhatsApp number

      // Here you would look up the Aivo user ID based on their WhatsApp number.
      // For this example, we'll use the WhatsApp number as a temporary user ID.
      const userId = from; 

      console.log(`Processing message from ${userId}: "${message}"`);

      // Call our Genkit flow to process the message
      const result = await processWhatsAppMessage({ message, userId });

      // In a real WAHA integration, you would now use the WAHA API
      // to send the `result.response` back to the user on WhatsApp.
      // For now, we'll just log it.
      console.log(`AI Response for ${userId}: "${result.response}"`);
      
      // Acknowledge receipt of the message
      return NextResponse.json({ success: true, response: result.response });
    }

    // If it's not a message event we care about, just acknowledge it.
    return NextResponse.json({ success: true, message: 'Event received' });

  } catch (error) {
    console.error('Error processing WhatsApp webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
