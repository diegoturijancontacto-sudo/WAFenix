module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido.' });
  }

  const apiUrl = process.env.WHATSAPP_API_URL;
  const apiKey = process.env.WHATSAPP_API_KEY;
  if (!apiUrl || !apiKey) {
    return res.status(503).json({ error: 'Falta configurar WHATSAPP_API_URL y WHATSAPP_API_KEY en Vercel.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (_) { body = {}; }
  }
  let to = String((body && body.to) || '').trim();
  if (/^[\d +()\-]+$/.test(to)) to = to.replace(/[ +()\-]/g, '');
  // WhatsApp Agent identifica destinatarios numéricos con el prefijo "user:".
  if (/^\d{8,15}$/.test(to)) to = 'user:' + to;
  const message = String((body && body.message) || '').trim();
  if (!/^(?:\d{8,15}|user:\d{1,30})$/.test(to) || !message || message.length > 4000) {
    return res.status(400).json({ error: 'Indica un destinatario válido (número con código de país o user:ID) y un mensaje de hasta 4000 caracteres.' });
  }

  try {
    const upstream = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: message }
      })
    });
    const raw = await upstream.text();
    if (!upstream.ok) {
      console.error('WhatsApp API returned', upstream.status, raw.slice(0, 500));
      return res.status(502).json({ error: 'La API de WhatsApp rechazó el envío (HTTP ' + upstream.status + ').' });
    }
    let result = {};
    try { result = JSON.parse(raw); } catch (_) {}
    return res.status(200).json({ ok: true, message: 'La API aceptó el envío.', data: result });
  } catch (error) {
    console.error('WhatsApp API request failed:', error && error.message);
    return res.status(502).json({ error: 'No se pudo conectar con la API de WhatsApp.' });
  }
};
