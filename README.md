# Cliente web ligero de WhatsApp

Interfaz HTML sencilla para abrir desde Opera Mini en el LG P350f. Vercel sirve la página y `/api/send` reenvía el número y el texto a una API configurada en el servidor. La clave nunca se envía al navegador.

## Configurar en Vercel

1. Importa este repositorio en Vercel.
2. En **Project Settings → Environment Variables**, agrega:
   - `WHATSAPP_API_URL`: `https://api.whatsapp.com/agent/v1/messages`.
   - `WHATSAPP_API_KEY`: clave de API usada como `Authorization: Bearer <clave>`.
3. Despliega de nuevo.
4. Abre el dominio de Vercel desde Opera Mini y envía un mensaje de prueba.

Al abrir la página, se consultan automáticamente las últimas 50 actualizaciones con `GET /agent/v1/updates?limit=50&timeout=15`. El token permanece en el servidor y la página llama a `/api/updates`; también puedes volver a cargar la lista con **Actualizar**.

La función envía `POST` JSON con el formato de WhatsApp Agent:

```json
{"messaging_product":"whatsapp","to":"user:192325112357002","type":"text","text":{"body":"Hola"}}
```

La clave se transmite en el encabezado `Authorization: Bearer ...`. El campo `to` admite un número con código de país o un identificador `user:ID`.

## Sobre el teléfono y el manual

El LG P350f funciona aquí como navegador para usar el panel; el envío lo realiza la API configurada en Vercel. Esta aplicación no controla por sí sola la SIM ni convierte el teléfono en un gateway de WhatsApp. El manual proporcionado lleva por título **WhatsApp Agent Platform – Developer Manual**, pero está escaneado y no fue posible extraer con fiabilidad sus instrucciones de conexión en este entorno. Por eso el conector queda configurable y sigue el contrato explícito de `POST` descrito arriba; aún no se ha enlazado a una ruta específica del manual.

Opera Mini antiguo puede no soportar TLS moderno que Vercel exige. Si no abre el sitio, prueba desde otra conexión/navegador compatible; no desactives HTTPS ni pongas la clave en la página.
