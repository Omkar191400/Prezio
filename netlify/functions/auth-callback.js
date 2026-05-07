exports.handler = async (event) => {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html' },
    body: `<!DOCTYPE html><html><body><script>
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      if (token && window.opener) {
        window.opener.postMessage(
          'authorization:github:success:' + JSON.stringify({ token, provider: 'github' }), '*'
        );
        window.close();
      }
    <\/script></body></html>`
  };
};
