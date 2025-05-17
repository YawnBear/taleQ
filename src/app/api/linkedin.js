const express = require('express');
const axios = require('axios');
const qs = require('querystring');

const app = express();
const CLIENT_ID = '86t5bmk7gdh1cf';
const CLIENT_SECRET = 'WPL_AP1.BDBDTJVmD7oTaCFu.3f0Nxw==';
const REDIRECT_URI = 'https://tale-q.vercel.app/auth/linkedin/callback';

app.get('/auth/linkedin', (req, res) => {
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=r_liteprofile%20r_emailaddress`;
  res.redirect(authUrl);
});

app.get('/auth/linkedin/callback', async (req, res) => {
  const code = req.query.code;
  const tokenRes = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', qs.stringify({
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

  const accessToken = tokenRes.data.access_token;
  // Use accessToken to call LinkedIn APIs
  res.send('Authenticated! Access Token: ' + accessToken);
});

app.listen(3000, () => console.log('Server started on http://localhost:3000'));