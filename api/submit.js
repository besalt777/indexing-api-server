// 경로: /api/submit.js
import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { url, type } = req.body;

    if (!url || !type) {
      return res.status(400).json({ message: 'Missing url or type' });
    }

    const key = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);

    const jwtClient = new google.auth.JWT({
      email: key.client_email,
      key: key.private_key,
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });

    await jwtClient.authorize();

    const indexing = google.indexing({
      version: 'v3',
      auth: jwtClient,
    });

    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url,
        type,
      },
    });

    res.status(200).json({ message: 'Indexed!', data: response.data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error', error: error.message });
  }
}

