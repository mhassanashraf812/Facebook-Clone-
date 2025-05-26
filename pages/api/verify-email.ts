// import { NextApiRequest, NextApiResponse } from "next";
// import { connectToDB } from "@utils/db";
// import User from "@models/User";

// const handler = async (req: NextApiRequest, res: NextApiResponse) => {
//   if (req.method !== "POST") return res.status(405).json("Method not allowed");
  
//   try {
//     await connectToDB();
//     const { userId, token } = req.body;

//     if (!userId || !token) {
//       return res.status(400).json("Missing userId or token");
//     }

//     const user = await User.findById(userId);
    
//     if (!user) {
//       return res.status(404).json("User not found");
//     }

//     if (user.isVerified) {
//       return res.status(400).json("Email already verified");
//     }

//     if (user.emailToken !== token) {
//       return res.status(400).json("Invalid verification token");
//     }

//     // Update user as verified
//     await User.findByIdAndUpdate(userId, {
//       isVerified: true,
//       emailToken: null
//     });

//     return res.status(200).json("Email verified successfully");
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json("Internal server error");
//   }
// };

// export default handler;
import type { NextApiRequest, NextApiResponse } from "next"
import { connectToDB } from "@utils/db"
import User from "@models/User"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") return res.status(405).json("Method not allowed")

  try {
    await connectToDB()
    const { userId, token } = req.body

    if (!userId || !token) {
      return res.status(400).json("Missing verification parameters")
    }

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json("User not found")
    }

    if (user.isVerified) {
      return res.status(400).json("Email already verified")
    }

    if (user.emailToken !== token) {
      return res.status(400).json("Invalid verification token")
    }

    // Verify the user
    await User.findByIdAndUpdate(userId, {
      isVerified: true,
      emailToken: null, // Clear the token
    })

    return res.status(200).json("Email verified successfully")
  } catch (error: any) {
    console.error("Email verification error:", error)
    return res.status(500).json("Internal server error")
  }
}

export default handler
