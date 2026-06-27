import OpenAI from 'openai';
import { SYSTEM_PROMPT, buildUserPrompt } from '../prompt.mjs';

// Adapter GPT-4o mini (keputusan stack tim). Butuh OPENAI_API_KEY.
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

export const meta = { id: 'openai', label: `OpenAI ${MODEL}` };

let client;
function getClient() {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY belum diset (lihat .env.example)');
  client ??= new OpenAI();
  return client;
}

export async function extract(listingText) {
  const res = await getClient().chat.completions.create({
    model: MODEL,
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(listingText) },
    ],
  });
  return JSON.parse(res.choices[0].message.content);
}
