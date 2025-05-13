import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const response = await fetch(`${process.env.OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://facebook-clone-m-hassan-ashraf.vercel.app',
      },
      body: JSON.stringify({
         model: 'mistralai/mistral-7b-instruct', // ✅ updated model ID.
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: message },
        ],
      }),
    });

    const data = await response.json();
    // console.log('📨 OpenRouter response:', JSON.stringify(data, null, 2));

    if (data.error) {
      console.error('❌ OpenRouter API Error:', data.error);
      return res.status(500).json({ error: data.error.message || 'OpenRouter error' });
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return res.status(500).json({ error: 'Invalid response from OpenRouter', data });
    }

    return res.status(200).json({ message: content });
  } catch (err) {
    console.error('❌ Network/API Error:', err);
    return res.status(500).json({ error: 'Failed to get response from OpenRouter.' });
  }
}
