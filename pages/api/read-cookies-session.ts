import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import cookie from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookies = cookie.parse(req.headers.cookie || '');
  const session = await getSession({ req });
  res.status(200).json({ cookies, session });
}
