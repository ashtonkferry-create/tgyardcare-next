const crypto = require('crypto');
const https = require('https');

const sa = JSON.parse(Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '', 'base64').toString());

const now = Math.floor(Date.now() / 1000);
const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
const payload = Buffer.from(JSON.stringify({
  iss: sa.client_email,
  scope: 'https://www.googleapis.com/auth/webmasters.readonly',
  aud: 'https://oauth2.googleapis.com/token',
  iat: now,
  exp: now + 3600
})).toString('base64url');

const sig = crypto.sign('RSA-SHA256', Buffer.from(header + '.' + payload), {
  key: sa.private_key,
  padding: crypto.constants.RSA_PKCS1_PADDING
});
const jwt = header + '.' + payload + '.' + sig.toString('base64url');

const data = 'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=' + jwt;

const req = https.request('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
}, (res) => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    const parsed = JSON.parse(body);
    if (!parsed.access_token) {
      console.log('AUTH FAILED:', body);
      return;
    }
    console.log('Auth OK, listing all GSC sites...');

    // List ALL sites the service account can access
    const gsc = https.request('https://www.googleapis.com/webmasters/v3/sites', {
      headers: { 'Authorization': 'Bearer ' + parsed.access_token }
    }, (r2) => {
      let b = '';
      r2.on('data', c => b += c);
      r2.on('end', () => {
        console.log('Status:', r2.statusCode);
        console.log('Response:', b);
      });
    });
    gsc.end();
  });
});
req.write(data);
req.end();
