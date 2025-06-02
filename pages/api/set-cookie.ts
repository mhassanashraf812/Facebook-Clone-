import { NextApiRequest, NextApiResponse } from 'next';
import cookie from 'cookie';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Set-Cookie', cookie.serialize('customCookie', 'cookieValue', {
    httpOnly: false,
    path: '/',
    maxAge: 60 * 60 * 24, // 1 day
  }));
  res.status(200).json({ message: 'Custom cookie set!' });
}
