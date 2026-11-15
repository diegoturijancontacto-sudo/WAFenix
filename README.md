# Cliente web ligero de WhatsApp

Interfaz HTML sencilla para abrir desde Opera Mini en el LG P350f. Vercel sirve la página y `/api/send` reenvía el número y el texto a una API configurada en el servidor. La clave nunca se envía al navegador.

## Configurar en Vercel

1. Importa este repositorio en Vercel.
2. En **Project Settings → Environment Variables**, agrega:
   - `WHATSAPP_API_URL`: URL HTTPS del endpoint de tu API que recibe envíos.
   - `WHATSAPP_API_KEY`: clave de API usada como `Authorization: Bearer <clave>`.
3. Despliega de nuevo.
4. Abre el dominio de Vercel desde Opera Mini y envía un mensaje de prueba.

El endpoint configurado debe aceptar `POST` JSON con esta forma:

```json
{"to":"5215512345678","message":"Hola"}
```

La función transmite ese mismo JSON con el encabezado `Authorization: Bearer ...`. Si tu API usa otros nombres de campo o autenticación, adapta el bloque `fetch` en `api/send.js`.

## Sobre el teléfono y el manual

El LG P350f funciona aquí como navegador para usar el panel; el envío lo realiza la API configurada en Vercel. Esta aplicación no controla por sí sola la SIM ni convierte el teléfono en un gateway de WhatsApp. El manual proporcionado lleva por título **WhatsApp Agent Platform – Developer Manual**, pero está escaneado y no fue posible extraer con fiabilidad sus instrucciones de conexión en este entorno. Por eso el conector queda configurable y sigue el contrato explícito de `POST` descrito arriba; aún no se ha enlazado a una ruta específica del manual.

Opera Mini antiguo puede no soportar TLS moderno que Vercel exige. Si no abre el sitio, prueba desde otra conexión/navegador compatible; no desactives HTTPS ni pongas la clave en la página.
