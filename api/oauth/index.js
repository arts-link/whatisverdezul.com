const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

export default async function handler(req, res) {
  const { searchParams } = new URL(req.url, `https://${req.headers.host}`);
  const code = searchParams.get('code');

  if (!code) {
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=repo`;
    return res.redirect(302, authUrl);
  }

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code }),
    });
    const { access_token, error } = await tokenRes.json();

    if (error || !access_token) {
      return res.status(400).send(`Auth error: ${error}`);
    }

    const script = `
      <script>
        const msg = { token: "${access_token}", provider: "github" };
        window.opener.postMessage("authorization:github:success:" + JSON.stringify(msg), "*");
        window.close();
      <\/script>`;
    res.setHeader('Content-Type', 'text/html');
    return res.send(script);
  } catch (err) {
    return res.status(500).send('OAuth error');
  }
}
