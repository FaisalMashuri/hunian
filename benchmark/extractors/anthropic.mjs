import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT, buildUserPrompt } from '../prompt.mjs';

// Adapter pembanding: Claude Haiku 4.5. Butuh ANTHROPIC_API_KEY.
// Model id terbaru per env: claude-haiku-4-5-20251001.
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001';

export const meta = { id: 'anthropic', label: `Anthropic ${MODEL}` };

let client;
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY belum diset (lihat .env.example)');
  client ??= new Anthropic();
  return client;
}

export async function extract(listingText) {
  const res = await getClient().messages.create({
    model: MODEL,
    max_tokens: 1024,
    temperature: 0,
    system: SYSTEM_PROMPT,
    messages: [
      { role: 'user', content: buildUserPrompt(listingText) },
      // Prefill "{" memaksa output mulai sebagai JSON murni.
      { role: 'assistant', content: '{' },
    ],
  });
  const text = '{' + res.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
  return JSON.parse(text);
}
