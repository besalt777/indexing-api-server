import jwt from 'jsonwebtoken';
import axios from 'axios';
import serviceAccount from '../your-service-account-key.json' assert { type: "json" };

export default async function handler(req, res) {
  const now = Math.floor(Date.now() / 1000);

  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const token = jwt.sign(payload, serviceAccount.private_key, { algorithm: 'RS256' });

  try {
    const response = await axios.post('https://oauth2.googleapis.com/token', null, {
      params: {
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: token,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    res.status(200).json({ access_token: response.data.access_token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

