module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { image, spoons } = req.body;
  const imageData = image.split(',')[1];
  const spoonList = spoons.map((s, i) => `${i + 1}. ${s.filename}`).join('\n');

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
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Here is a hand-drawn spoon. I have these spoon artworks:\n${spoonList}\n\nWhich filename is most similar in shape to this drawing? Reply with ONLY the filename, nothing else.`
            },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/png',
                data: imageData
              }
            }
          ]
        }
      ]
    })
  });

  const data = await response.json();
  const filename = data.content[0].text.trim();
  res.status(200).json({ filename });
}