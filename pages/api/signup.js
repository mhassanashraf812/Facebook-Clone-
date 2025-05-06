import dbConnect from '../../lib/dbConnect'; 
import User from '../../models/User';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  await dbConnect();

  const { email, password } = req.body;

  const token = crypto.randomBytes(32).toString('hex');

  const user = await User.create({
    email,
    password,
    isVerified: false,
    verificationToken: token,
  });

  const transporter = nodemailer.createTransport({
    service: 'Gmail', // or any SMTP
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const verificationUrl = `https://yourdomain.com/verify?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Verify your Email',
    html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email!</p>`,
  });

  res.status(200).json({ message: 'Signup successful, please check your email to verify.' });
}
