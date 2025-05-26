// import { NextApiRequest, NextApiResponse } from "next";
// import { connectToDB } from "@utils/db";
// import User from "@models/User";
// import crypto from "crypto";
// import nodemailer from "nodemailer";

// const handler = async (req: NextApiRequest, res: NextApiResponse) => {
//   if (req.method !== "POST") return res.status(405).json("Method not allowed");
  
//   try {
//     await connectToDB();
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json("Email is required");
//     }

//     const user = await User.findOne({ email });
    
//     if (!user) {
//       return res.status(404).json("User not found");
//     }

//     if (user.isVerified) {
//       return res.status(400).json("Email already verified");
//     }

//     // Generate new token
//     const emailToken = crypto.randomBytes(32).toString('hex');
//     await User.findByIdAndUpdate(user._id, { emailToken });

//     // Send verification email
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     const verificationUrl = `${process.env.NEXTAUTH_URL}/verify/${user._id}?token=${emailToken}`;
    
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: 'Verify Your Facebook Account',
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//           <h2 style="color: #1877f2;">Verify Your Email</h2>
//           <p>Hi ${user.name},</p>
//           <p>Please verify your email address by clicking the button below:</p>
//           <a href="${verificationUrl}" style="background-color: #1877f2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
//             Verify Email Address
//           </a>
//           <p>Or copy and paste this link in your browser:</p>
//           <p style="word-break: break-all; color: #1877f2;">${verificationUrl}</p>
//           <p>This link will expire in 24 hours.</p>
//         </div>
//       `,
//     };

//     await transporter.sendMail(mailOptions);
    
//     return res.status(200).json("Verification email sent successfully");
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json("Internal server error");
//   }
// };

// export default handler;import type { NextApiRequest, NextApiResponse } from "next"
import type { NextApiRequest, NextApiResponse } from "next"
import { connectToDB } from "@utils/db"
import User from "@models/User"
import crypto from "crypto"
import sgMail from "@sendgrid/mail"

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") return res.status(405).json("Method not allowed")

  try {
    await connectToDB()
    const { email } = req.body

    if (!email) {
      return res.status(400).json("Email is required")
    }

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json("User not found")
    }

    if (user.isVerified) {
      return res.status(400).json("Email already verified")
    }

    // Generate new token
    const emailToken = crypto.randomBytes(32).toString("hex")
    await User.findByIdAndUpdate(user._id, { emailToken })

    // Get the base URL with fallback
    const baseUrl =
      process.env.NEXTAUTH_URL || process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : req.headers.host
          ? `https://${req.headers.host}`
          : "http://localhost:3000"

    const verificationUrl = `${baseUrl}/verify/${user._id}?token=${emailToken}`

    console.log("🔗 Generated verification URL:", verificationUrl) // Debug log

    // SendGrid email configuration
    const msg = {
      to: email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL!,
        name: "Facebook Clone",
      },
      subject: "Verify Your Facebook Account - Resent",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1877f2; font-size: 28px; margin: 0;">Verify Your Email</h1>
            </div>
            
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Hi <strong>${user.name}</strong>,</p>
            
            <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 30px;">
              You requested a new verification email. Please click the button below to verify your email address:
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
                        box-shadow: 0 4px 12px rgba(24, 119, 242, 0.3);">
                ✅ Verify Email Address
              </a>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <p style="font-size: 14px; color: #666; margin: 0 0 10px 0;">
                <strong>Can't click the button?</strong> Copy and paste this link:
              </p>
              <p style="word-break: break-all; color: #1877f2; font-size: 14px; margin: 0; padding: 10px; background: white; border-radius: 4px;">
                ${verificationUrl}
              </p>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              ⏰ This link will expire in 24 hours.
            </p>
          </div>
        </div>
      `,
      text: `
        Hi ${user.name},
        
        Please verify your email address by visiting this link:
        ${verificationUrl}
        
        This link will expire in 24 hours.
      `,
    }

    try {
      await sgMail.send(msg)
      console.log("✅ Verification email resent successfully to:", email)
      return res.status(200).json("Verification email sent successfully")
    } catch (emailError: any) {
      console.error("❌ SendGrid email error:", emailError.response?.body || emailError.message)
      return res.status(500).json("Failed to send verification email. Please try again later.")
    }
  } catch (error: any) {
    console.error("Resend verification error:", error)
    return res.status(500).json("Internal server error")
  }
}

export default handler
