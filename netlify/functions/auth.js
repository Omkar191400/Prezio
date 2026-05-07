exports.handler = async (event) => {
  const { code, provider } = event.queryStringParameters || {};
  const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
  const REDIRECT = `https://prezio.ai/.netlify/functions/auth`;

  // Step 1 — redirect to GitHub
  if (!code) {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT,
      scope: 'repo,user',
    });
    return {
      statusCode: 302,
      headers: { Location: `https://github.com/login/oauth/authorize?${params}` },
      body: ''
    };
  }

  // Step 2 — exchange code for token
  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code, redirect_uri: REDIRECT })
  });
  const data = await res.json();
  const token = data.access_token;
  const content = `
    <script>
      (function() {
        function receiveMessage(e) {
          window.opener.postMessage(
            'authorization:github:success:{"token":"${token}","provider":"github"}',
            e.origin
          );
        }
        window.addEventListener('message', receiveMessage, false);
        window.opener.postMessage('authorizing:github', '*');
      })()
    <\/script>
  `;
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html' },
    body: `<!DOCTYPE html><html><body>${content}</body></html>`
  };
};
