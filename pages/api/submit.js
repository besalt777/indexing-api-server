export default async function handler(req, res) {
  console.log("Incoming method:", req.method);
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "Missing URL" });
  }

  const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || "{}");
  const jwt = await getJWT(serviceAccount);

  const response = await fetch("https://indexing.googleapis.com/v3/urlNotifications:publish", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jwt}`,
    },
    body: JSON.stringify({
      url: url,
      type: "URL_UPDATED",
    }),
  });

  const result = await response.json();
  res.status(200).json(result);
}

async function getJWT(serviceAccount) {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600;

  const payload = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/indexing",
    aud: "https://oauth2.googleapis.com/token",
    iat,
    exp,
  };

  const base64UrlEncode = (obj) => Buffer.from(JSON.stringify(obj))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const encodedHeader = base64UrlEncode({ alg: "RS256", typ: "JWT" });
  const encodedPayload = base64UrlEncode(payload);
  const toSign = `${encodedHeader}.${encodedPayload}`;

  const crypto = await import("crypto");
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(toSign);
  const signature = sign.sign(serviceAccount.private_key, "base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const jwt = `${toSign}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const data = await res.json();
  return data.access_token;
}
