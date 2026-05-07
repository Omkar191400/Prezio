const fetch = require('node-fetch');

exports.handler = async (event) => {
  const { code } = event.queryStringParameters || {};

  if (!code) {
    // Step 1: Redirect to GitHub OAuth
    const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID,
      redirect_uri: `https://prezio.ai/.netlify/functions/auth`,
      scope: 'repo,user',
      state: 'prezio-cms'
    });
    return {
      statusCode: 302,
      headers: { Location: `https://github.com/login/oauth/authorize?${params}` }
    };
  }

  // Step 2: Exchange code for token
  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      })
    });
    const data = await response.json();
    const token = data.access_token;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: `<!DOCTYPE html><html><body><script>
        const msg = JSON.stringify({ token: '${token}', provider: 'github' });
        window.opener && window.opener.postMessage(
          'authorization:github:success:' + msg, '*'
        );
        window.close();
      <\/script></body></html>`
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: 'OAuth error: ' + err.message
    };
  }
};
