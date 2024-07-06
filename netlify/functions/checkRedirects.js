const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const { url } = JSON.parse(event.body);

  if (!url) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'No URL provided' }),
    };
  }

  try {
    const response = await fetch(url, { redirect: 'manual' });
    const redirects = [];

    while (response.status >= 300 && response.status < 400) {
      redirects.push({
        from: response.url,
        to: response.headers.get('location'),
        status_code: response.status,
      });
      const nextUrl = response.headers.get('location');
      response = await fetch(nextUrl, { redirect: 'manual' });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        redirects,
        final_result: {
          final_url: response.url,
          status_code: response.status,
        },
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};