// pages/api/tokens.js
import { google } from 'googleapis';

export default async function handler(req, res) {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });

    const client = await auth.getClient();

    res.status(200).json({ message: 'Google auth client successfully initialized.' });
  } catch (error) {
    console.error('Token handler error:', error);
    res.status(500).json({ error: 'Failed to initialize Google auth client.' });
  }
}

