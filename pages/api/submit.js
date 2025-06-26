// pages/api/submit.js
import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);

    const jwtClient = new google.auth.JWT(
      serviceAccount.client_email,
      null,
      serviceAccount.private_key,
      ['https://www.googleapis.com/auth/indexing']
    );

    await jwtClient.authorize();

    const indexing = google.indexing({ version: 'v3', auth: jwtClient });

    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url: req.body.url,
        type: 'URL_UPDATED',
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error submitting to Google Indexing API:', error);
    res.status(500).json({
      error: 'Indexing failed',
      details: error.message,
    });
  }
}

