import type { NextApiRequest, NextApiResponse } from "next"
import { connectToDB } from "@utils/db"
import User from "@models/User"
import bcrypt from "bcrypt"
import crypto from "crypto"
import nodemailer from "nodemailer"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") return res.status(405).json("Method not allowed")

  try {
    await connectToDB()
    const { name, email, password, dob, gender } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) return res.status(400).json("Email already exists")

    const hashedPassword = await bcrypt.hash(password, 10)
    const emailToken = crypto.randomBytes(32).toString("hex")

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      dob,
      gender,
      emailToken,
      isVerified: false,
    })

    // Send verification email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify/${newUser._id}?token=${emailToken}`

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Facebook Account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1877f2;">Welcome to Facebook!</h2>
          <p>Hi ${name},</p>
          <p>Thank you for creating your Facebook account. Please verify your email address by clicking the button below:</p>
          <a href="${verificationUrl}" style="background-color: #1877f2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
            Verify Email Address
          </a>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #1877f2;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create this account, please ignore this email.</p>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)

    return res.status(201).json("Account created successfully! Please check your email to verify your account.")
  } catch (error) {
    console.log(error)
    res.status(500).json("Internal Server Error")
  }
}

export default handler
