// Vercel Serverless Function: /api/generate

async function callClaude(prompt, apiKey, systemPrompt) {
  const body = { model: 'claude-opus-4-6', max_tokens: 8192, messages: [{ role: 'user', content: prompt }] };
  if (systemPrompt) body.system = systemPrompt;
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Claude API error (${res.status}): ${await res.text()}`);
  const data = await res.json();
  return data.content.map(c => c.text || '').join('');
}

async function callGPT(prompt, apiKey, systemPrompt) {
  const messages = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: prompt });
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'gpt-5', messages, max_tokens: 8192 }),
  });
  if (!res.ok) throw new Error(`OpenAI API error (${res.status}): ${await res.text()}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

async function callGLM(prompt, apiKey, systemPrompt) {
  const messages = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: prompt });
  const res = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'glm-4-plus', messages, max_tokens: 8192 }),
  });
  if (!res.ok) throw new Error(`GLM API error (${res.status}): ${await res.text()}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt, models, apiKeys, envKeys } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  const systemPrompt = `You are an expert physician and insurance appeals specialist. Write a compelling, thorough insurance appeal letter based on the information provided. Include specific clinical justifications, relevant guidelines, legal references, and a clear request for overturn. Structure the letter professionally with all required elements.`;

  const results = [];

  for (const model of models) {
    try {
      let text;
      const keyName = model.toUpperCase().replace(/[^A-Z0-9]/g, '_');
      const key = apiKeys?.[model] || (envKeys ? process.env[`${keyName}_API_KEY`] : null);

      if (model === 'claude-opus-4.6') {
        if (!key) throw new Error('Claude API key not provided');
        text = await callClaude(prompt, key, systemPrompt);
      } else if (model === 'gpt-5') {
        if (!key) throw new Error('OpenAI API key not provided');
        text = await callGPT(prompt, key, systemPrompt);
      } else if (model === 'glm-5') {
        if (!key) throw new Error('GLM API key not provided');
        text = await callGLM(prompt, key, systemPrompt);
      } else if (model === 'openevidence') {
        continue;
      }

      results.push({ model, text, status: 'success' });
    } catch (err) {
      results.push({ model, text: '', status: 'error', error: err.message });
    }
  }

  res.json({ results });
}
