module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { image, spoons } = req.body;
  const imageData = image.split(',')[1];

  // Only send 10 spoons at a time to stay within memory limits
  const subset = spoons.slice(0, 10);

  const spoonImages = await Promise.all(
    subset.map(async (s) => {
      const url = `https://spoons-sigma.vercel.app/spoons/${s.filename}`;
      const r = await fetch(url);
      const buf = await r.arrayBuffer();
      const b64 = Buffer.from(buf).toString('base64');
      return { filename: s.filename, b64 };
    })
  );

  const content = [
    {
      type: 'text',
      text: 'Here is a hand-drawn spoon followed by my spoon artworks. Which artwork is most similar in shape to the drawing? Reply with ONLY the filename, nothing else.'
    },
    {
      type: 'image',
      source: { type: 'base64', media_type: 'image/png', data: imageData }
    },
    {
      type: 'text',
      text: 'Here are my spoon artworks:'
    },
    ...spoonImages.map((s, i) => ([
      { type: 'text', text: `${i + 1}. ${s.filename}` },
      { type: 'image', source: { type: 'base64', media_type: 'image/png', data: s.b64 } }
    ])).flat()
  ];

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 100,
      messages: [{ role: 'user', content }]
    })
  });

  const data = await response.json();
  const filename = data.content[0].text.trim();
  res.status(200).json({ filename });
}