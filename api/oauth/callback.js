const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

export default async function handler(req, res) {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    return res.status(500).send('Missing GitHub OAuth environment variables');
  }

  const requestUrl = new URL(req.url, `https://${req.headers.host}`);
  const callbackUrl = `https://${req.headers.host}/api/oauth/callback`;
  const code = requestUrl.searchParams.get('code');

  if (!code) {
    return res.status(400).send('Missing OAuth code');
  }

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        redirect_uri: callbackUrl,
      }),
    });

    const { access_token, error, error_description } = await tokenRes.json();

    if (error || !access_token) {
      return res.status(400).send(`Auth error: ${error_description || error || 'No access token returned'}`);
    }

    const message = `authorization:github:success:${JSON.stringify({ token: access_token, provider: 'github' })}`;
    const script = `
      <!doctype html>
      <html>
        <body>
          <script>
            const receiveMessage = (e) => {
              window.opener.postMessage(${JSON.stringify(message)}, e.origin);
              window.removeEventListener("message", receiveMessage, false);
              window.close();
            };
            window.addEventListener("message", receiveMessage, false);
            window.opener.postMessage("authorizing:github", "*");
          <\/script>
        </body>
      </html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(script);
  } catch {
    return res.status(500).send('OAuth error');
  }
}
