// pages/api/submit.js
import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    console.log('✅ SUBMIT 호출됨');

    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    console.log('✅ 서비스 계정 로드됨');

    const jwtClient = new google.auth.JWT(
      serviceAccount.client_email,
      null,
      serviceAccount.private_key,
      ['https://www.googleapis.com/auth/indexing']
    );

    await jwtClient.authorize();
    console.log('✅ 인증 성공');

    const indexing = google.indexing({
      version: 'v3',
      auth: jwtClient
    });

    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url: req.body.url,
        type: 'URL_UPDATED',
      },
    });

    console.log('✅ 색인 요청 완료', response.data);

    res.status(200).json(response.data);
  } catch (error) {
    console.error('❌ Google Indexing API 전송 오류:', error);
    res.status(500).json({
      error: 'Indexing failed',
      details: error.message,
    });
  }
}
