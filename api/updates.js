module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método no permitido.' });
  }

  const apiKey = process.env.WHATSAPP_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Falta configurar WHATSAPP_API_KEY en Vercel.' });
  }

  try {
    const updatesUrl = new URL('https://api.whatsapp.com/agent/v1/updates');
    updatesUrl.searchParams.set('limit', '50');
    updatesUrl.searchParams.set('timeout', '15');

    const upstream = await fetch(updatesUrl, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(20000)
    });
    const raw = await upstream.text();
    if (!upstream.ok) {
      console.error('WhatsApp updates API returned', upstream.status, raw.slice(0, 500));
      return res.status(502).json({ error: 'No se pudieron cargar las actualizaciones de WhatsApp (HTTP ' + upstream.status + ').' });
    }

    let data;
    try { data = JSON.parse(raw); } catch (_) {
      return res.status(502).json({ error: 'La API de WhatsApp devolvió una respuesta que no es JSON.' });
    }
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(data);
  } catch (error) {
    console.error('WhatsApp updates request failed:', error && error.message);
    return res.status(502).json({ error: 'No se pudieron cargar las actualizaciones de WhatsApp.' });
  }
};
