import { GoogleAuth } from 'google-auth-library';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'Missing URL' });
  }

  try {
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    const auth = new GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/indexing']
    });

    const client = await auth.getClient();

    const endpoint = 'https://indexing.googleapis.com/v3/urlNotifications:publish';
    const response = await client.request({
      url: endpoint,
      method: 'POST',
      data: {
        url: url,
        type: 'URL_UPDATED',
      }
    });

    res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    res.status(500).json({
      error: 'Indexing failed',
      details: error.message || error.toString()
    });
  }
}

