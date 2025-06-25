// api/create-jwt.js
import jwt from 'jsonwebtoken';

export default function handler(req, res) {
  const payload = {
    user: 'besalt777',
    role: 'admin',
  };

  const secret = process.env.JWT_SECRET || 'default-secret';

  const token = jwt.sign(payload, secret, { expiresIn: '1h' });

  res.status(200).json({ jwt: token });
}

