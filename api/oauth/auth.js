const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CALLBACK_URL = 'https://whatisverdezul.com/api/oauth/callback';

export default async function handler(req, res) {
  if (!CLIENT_ID) {
    return res.status(500).send('Missing GITHUB_CLIENT_ID');
  }

  const requestUrl = new URL(req.url, `https://${req.headers.host}`);
  const state = requestUrl.searchParams.get('state');
  const authUrl = new URL('https://github.com/login/oauth/authorize');
  authUrl.searchParams.set('client_id', CLIENT_ID);
  authUrl.searchParams.set('scope', 'repo');
  authUrl.searchParams.set('redirect_uri', CALLBACK_URL);

  if (state) {
    authUrl.searchParams.set('state', state);
  }

  return res.redirect(302, authUrl.toString());
}
