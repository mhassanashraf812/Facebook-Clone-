import dbConnect from '../../lib/dbConnect';
import User from '../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  await dbConnect();

  const { token } = req.query;

  const user = await User.findOne({ verificationToken: token });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired verification link.' });
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();

  res.status(200).json({ message: 'Email verified successfully!' });
}
