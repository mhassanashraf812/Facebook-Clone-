import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcrypt"
import User from "@models/User"
import { connectToDB } from "@utils/db"

export const authOptions = {
  providers: [
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        await connectToDB()
        if (!credentials.email || !credentials.password) {
          throw new Error("Email and password required")
        }

        const user = await User.findOne({ email: credentials.email }).select("+password")

        if (!user) {
          throw new Error("Email does not exist")
        }
        if (!user.isVerified) {
          throw new Error("Please verify your email before logging in")
        }

        const isCorrectPassword = await compare(credentials.password, user.password)

        if (!isCorrectPassword) {
          throw new Error("Incorrect password")
        }

        return user
      },
    }),
  ],
  pages: {
    signIn: "/auth",
  },
  debug: process.env.NODE_ENV === "development",
  session: { strategy: "jwt", maxAge: 30 },
  jwt: {
    secret: process.env.NEXTAUTH_JWT_SECRET,
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)



// import NextAuth from "next-auth"
// import Credentials from "next-auth/providers/credentials"
// import { compare } from "bcrypt"
// import User from "@models/User"
// import { connectToDB } from "@utils/db"

// export const authOptions = {
//   providers: [
//     Credentials({
//       id: "credentials",
//       name: "Credentials",
//       credentials: {
//         email: {
//           label: "Email",
//           type: "text",
//         },
//         password: {
//           label: "Password",
//           type: "password",
//         },
//       },
//       async authorize(credentials) {
//         await connectToDB()
//         if (!credentials.email || !credentials.password) {
//           throw new Error("Email and password required")
//         }

//         const user = await User.findOne({ email: credentials.email }).select("+password")

//         if (!user) {
//           throw new Error("Email does not exist")
//         }

//         // Check if user is verified
//         if (!user.isVerified) {
//           throw new Error("Please verify your email before logging in")
//         }

//         const isCorrectPassword = await compare(credentials.password, user.password)

//         if (!isCorrectPassword) {
//           throw new Error("Incorrect password")
//         }

//         return user
//       },
//     }),
//   ],
//   pages: {
//     signIn: "/auth",
//   },
//   debug: process.env.NODE_ENV === "development",
//   session: { strategy: "jwt", maxAge: 30 },
//   jwt: {
//     secret: process.env.NEXTAUTH_JWT_SECRET,
//   },
//   secret: process.env.NEXTAUTH_SECRET,
// }

// export default NextAuth(authOptions)
