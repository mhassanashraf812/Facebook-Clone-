import { NextApiRequest, NextApiResponse } from "next";
import { connectToDB } from "@utils/db";
import User from "@models/User";
import crypto from "crypto";
import nodemailer from "nodemailer";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") return res.status(405).json("Method not allowed");
  
  try {
    await connectToDB();
    const { email } = req.body;

    if (!email) {
      return res.status(400).json("Email is required");
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json("User not found");
    }

    if (user.isVerified) {
      return res.status(400).json("Email already verified");
    }

    // Generate new token
    const emailToken = crypto.randomBytes(32).toString('hex');
    await User.findByIdAndUpdate(user._id, { emailToken });

    // Send verification email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify/${user._id}?token=${emailToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Facebook Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1877f2;">Verify Your Email</h2>
          <p>Hi ${user.name},</p>
          <p>Please verify your email address by clicking the button below:</p>
          <a href="${verificationUrl}" style="background-color: #1877f2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
            Verify Email Address
          </a>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #1877f2;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    
    return res.status(200).json("Verification email sent successfully");
  } catch (error) {
    console.log(error);
    return res.status(500).json("Internal server error");
  }
};

export default handler;