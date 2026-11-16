module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método no permitido.' });
  }

  // Protección básica: define APP_SECRET en Vercel y mándalo en el header x-app-secret
  const appSecret = process.env.APP_SECRET;
  if (appSecret && req.headers['x-app-secret'] !== appSecret) {
    return res.status(401).json({ error: 'No autorizado.' });
  }

  const apiKey = process.env.WHATSAPP_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Falta configurar WHATSAPP_API_KEY en Vercel.' });
  }

  try {
    const updatesUrl = new URL('https://api.whatsapp.com/agent/v1/updates');
    updatesUrl.searchParams.set('limit', '50');
    updatesUrl.searchParams.set('timeout', '15');

    // offset opcional, solo si es un entero válido
    const offset = req.query && req.query.offset;
    if (offset !== undefined && /^\d+$/.test(String(offset))) {
      updatesUrl.searchParams.set('offset', String(offset));
    }

    const upstream = await fetch(updatesUrl, {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + apiKey, 'Accept': 'application/json' },
      signal: AbortSignal.timeout(28000)
    });

    res.setHeader('Cache-Control', 'no-store');

    // 204: sin novedades, no hay cuerpo ni next_offset
    if (upstream.status === 204) {
      return res.status(200).json({ empty: true, next_offset: offset ? Number(offset) : null });
    }

    const raw = await upstream.text();

    if (!upstream.ok) {
      console.error('WhatsApp updates API returned', upstream.status, raw.slice(0, 500));
      // Conserva 409 y 429 para que el cliente sepa qué hacer
      const status = [409, 429].includes(upstream.status) ? upstream.status : 502;
      return res.status(status).json({
        error: 'No se pudieron cargar las actualizaciones de WhatsApp (HTTP ' + upstream.status + ').'
      });
    }

    let data;
    try { data = JSON.parse(raw); } catch (_) {
      return res.status(502).json({ error: 'La API de WhatsApp devolvió una respuesta que no es JSON.' });
    }
    return res.status(200).json(data);
  } catch (error) {
    console.error('WhatsApp updates request failed:', error && error.message);
    return res.status(502).json({ error: 'No se pudieron cargar las actualizaciones de WhatsApp.' });
  }
};
