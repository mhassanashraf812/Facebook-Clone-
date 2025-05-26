// import type { NextApiRequest, NextApiResponse } from "next"
// import { connectToDB } from "@utils/db"
// import User from "@models/User"
// import bcrypt from "bcrypt"
// import crypto from "crypto"
// import nodemailer from "nodemailer"

// const handler = async (req: NextApiRequest, res: NextApiResponse) => {
//   if (req.method !== "POST") return res.status(405).json("Method not allowed")

//   try {
//     await connectToDB()
//     const { name, email, password, dob, gender } = req.body

//     const existingUser = await User.findOne({ email })
//     if (existingUser) return res.status(400).json("Email already exists")

//     const hashedPassword = await bcrypt.hash(password, 10)
//     const emailToken = crypto.randomBytes(32).toString("hex")

//     const newUser = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       dob,
//       gender,
//       emailToken,
//       isVerified: false,
//     })

//     // Send verification email
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     })

//     const verificationUrl = `${process.env.NEXTAUTH_URL}/verify/${newUser._id}?token=${emailToken}`

//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: "Verify Your Facebook Account",
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//           <h2 style="color: #1877f2;">Welcome to Facebook!</h2>
//           <p>Hi ${name},</p>
//           <p>Thank you for creating your Facebook account. Please verify your email address by clicking the button below:</p>
//           <a href="${verificationUrl}" style="background-color: #1877f2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
//             Verify Email Address
//           </a>
//           <p>Or copy and paste this link in your browser:</p>
//           <p style="word-break: break-all; color: #1877f2;">${verificationUrl}</p>
//           <p>This link will expire in 24 hours.</p>
//           <p>If you didn't create this account, please ignore this email.</p>
//         </div>
//       `,
//     }

//     await transporter.sendMail(mailOptions)

//     return res.status(201).json("Account created successfully! Please check your email to verify your account.")
//   } catch (error) {
//     console.log(error)
//     res.status(500).json("Internal Server Error")
//   }
// }

// export default handler
import type { NextApiRequest, NextApiResponse } from "next"
import { connectToDB } from "@utils/db"
import User from "@models/User"
import bcrypt from "bcrypt"
import crypto from "crypto"
import sgMail from "@sendgrid/mail"

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

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

    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify/${newUser._id}?token=${emailToken}`

    // SendGrid email configuration
    const msg = {
      to: email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL!,
        name: "Facebook Clone",
      },
      subject: "Verify Your Facebook Account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1877f2; font-size: 28px; margin: 0;">Welcome to Facebook!</h1>
            </div>
            
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Hi <strong>${name}</strong>,</p>
            
            <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 30px;">
              Thank you for creating your Facebook account! To get started, please verify your email address by clicking the button below:
            </p>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${verificationUrl}" 
                 style="background: linear-gradient(135deg, #1877f2 0%, #42a5f5 100%); 
                        color: white; 
                        padding: 16px 32px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        display: inline-block; 
                        font-weight: bold; 
                        font-size: 16px;
                        box-shadow: 0 4px 12px rgba(24, 119, 242, 0.3);
                        transition: all 0.3s ease;">
                ✅ Verify Email Address
              </a>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <p style="font-size: 14px; color: #666; margin: 0 0 10px 0;">
                <strong>Can't click the button?</strong> Copy and paste this link in your browser:
              </p>
              <p style="word-break: break-all; color: #1877f2; font-size: 14px; margin: 0; padding: 10px; background: white; border-radius: 4px; border-left: 4px solid #1877f2;">
                ${verificationUrl}
              </p>
            </div>
            
            <div style="border-top: 1px solid #e9ecef; padding-top: 20px; margin-top: 30px;">
              <p style="font-size: 14px; color: #666; margin: 0 0 10px 0;">
                ⏰ <strong>Important:</strong> This verification link will expire in 24 hours.
              </p>
              <p style="font-size: 14px; color: #666; margin: 0;">
                🔒 If you didn't create this account, please ignore this email and your email address will not be used.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e9ecef;">
              <p style="font-size: 14px; color: #999; margin: 0;">
                This email was sent by Facebook Clone
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
        Welcome to Facebook, ${name}!
        
        Please verify your email address by visiting this link:
        ${verificationUrl}
        
        This link will expire in 24 hours.
        
        If you didn't create this account, please ignore this email.
      `,
    }

    try {
      await sgMail.send(msg)
      console.log("✅ Verification email sent successfully to:", email)
      return res.status(201).json("Account created successfully! Please check your email to verify your account.")
    } catch (emailError: any) {
      console.error("❌ SendGrid email error:", emailError.response?.body || emailError.message)

      // Still create the account but inform about email issue
      return res.status(201).json({
        message:
          "Account created successfully! However, there was an issue sending the verification email. Please try resending it.",
        emailError: true,
      })
    }
  } catch (error: any) {
    console.error("Registration error:", error)
    res.status(500).json("Internal Server Error")
  }
}

export default handler
