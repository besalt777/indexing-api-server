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

    const key = JSON.parse(process.env.YOUR_SERVICE_ACCOUNT_KEY);

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
  console.error('��� INTERNAL ERROR:', error);  // 콘솔에 자세히 찍힘
  res.status(500).json({
    message: 'Internal Server Error',
    error: error.message,     // 간략한 에러 메시지
    stack: error.stack,       // 어떤 줄에서 에러났는지 추적 가능
    raw: error                // 전체 에러 객체 (예: Google API 응답)
  });
  }
}

