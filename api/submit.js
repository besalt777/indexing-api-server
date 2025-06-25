import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { url, type } = req.body;

  if (!url || !type) {
    return res.status(400).json({ message: 'Missing url or type' });
  }

  try {
    const auth = new google.auth.JWT({
      email: process.env.SERVICE_ACCOUNT_EMAIL,
      key: process.env.SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });

    const indexing = google.indexing({ version: 'v3', auth });

    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url: url,
        type: type,
      },
    });

    return res.status(200).json({ message: 'Success', response: response.data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error', error: error.message });
  }
}

