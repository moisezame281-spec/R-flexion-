export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST')    { res.status(405).json({error:'Method not allowed'}); return; }

  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLÉ_API_ANTHROPIC || process.env.CLE_API_ANTHROPIC;
  if (!apiKey) {
    return res.status(500).json({ error: { message: 'Clé API manquante — vérifier les variables Vercel' } });
  }

  try {
    const { system, messages, max_tokens } = req.body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key':         apiKey,
      },
      body: JSON.stringify({
        model:      'claude-opus-4-6',
        max_tokens: max_tokens || 1200,
        system,
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: { message: data?.error?.message || 'Erreur API Anthropic' }
      });
    }

    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: { message: err.message } });
  }
}
