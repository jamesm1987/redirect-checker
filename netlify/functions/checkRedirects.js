exports.handler = async function(event, context) {
    const fetch = (await import('node-fetch')).default;
  
    const { urls } = JSON.parse(event.body);
  
    if (!urls || !Array.isArray(urls)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No URLs provided or invalid format' }),
      };
    }
  
    const results = await Promise.all(urls.map(async (url) => {
      try {
        let response = await fetch(url, { redirect: 'manual' });
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
          url,
          redirects,
          final_result: {
            final_url: response.url,
            status_code: response.status,
          },
        };
      } catch (error) {
        return {
          url,
          error: error.message,
        };
      }
    }));
  
    return {
      statusCode: 200,
      body: JSON.stringify(results),
    };
  };