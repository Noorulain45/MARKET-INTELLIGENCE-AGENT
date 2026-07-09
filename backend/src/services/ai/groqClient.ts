import Groq from 'groq-sdk';
import { logger } from '../../utils/logger';

let groqClient: Groq | null = null;

export function getGroqClient(): Groq {
  if (!groqClient) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not configured');
    }
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

export async function generateCompletion(
  systemPrompt: string,
  userPrompt: string,
  model = 'llama-3.3-70b-versatile',
  maxTokens = 2048,
  temperature = 0.7
): Promise<string> {
  try {
    const client = getGroqClient();
    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature,
    });
    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    logger.error('Groq API error:', error);
    throw error;
  }
}

export async function streamCompletion(
  systemPrompt: string,
  userPrompt: string,
  onChunk: (chunk: string) => void,
  model = 'llama-3.3-70b-versatile'
): Promise<void> {
  try {
    const client = getGroqClient();
    const stream = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 4096,
      temperature: 0.7,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) onChunk(content);
    }
  } catch (error) {
    logger.error('Groq stream error:', error);
    throw error;
  }
}
