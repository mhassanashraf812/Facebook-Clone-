
"use client"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import axios from "axios"
import { toast } from "react-hot-toast"
import Image from "next/image"
import Link from "next/link"
import { BsMeta } from "react-icons/bs"

const VerifyAccount = () => {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const verifyEmail = async () => {
      const userId = params?.username
      const token = searchParams?.get("token")

      if (!userId || !token) {
        setError("Invalid verification link")
        setLoading(false)
        return
      }

      try {
        const response = await axios.post("/api/verify-email", {
          userId,
          token,
        })

        if (response.status === 200) {
          setVerified(true)
          toast.success("Email verified successfully!")
        }
      } catch (error: any) {
        setError(error.response?.data || "Verification failed")
        toast.error(error.response?.data || "Verification failed")
      } finally {
        setLoading(false)
      }
    }

    verifyEmail()
  }, [params?.username, searchParams])

  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center bg-[#e9ebee]">
        <div className="flex flex-col items-center space-y-4">
          <Image src={"/logo.png"} alt="logo" width={48} height={48} />
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full flex justify-center animate-spin items-center">
            <div className="w-14 h-14 bg-[#e9ebee] rounded-full"></div>
          </div>
          <p className="text-gray-700 font-semibold">Verifying your email...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-screen flex justify-center items-center bg-[#e9ebee]">
      <div className="flex flex-col items-center space-y-10 max-w-md mx-auto">
        <Image src={"/logo.png"} alt="logo" width={48} height={48} />

        <div className="bg-white rounded-lg p-8 shadow-md text-center">
          {verified ? (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Email Verified!</h2>
              <p className="text-gray-600 mb-6">
                Your email has been successfully verified. You can now log in to your account.
              </p>
              <Link
                href="/login"
                className="block w-full bg-[#1B74E4] text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Go to Login
              </Link>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Verification Failed</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="space-y-3">
                <Link
                  href="/verify-email"
                  className="block w-full bg-[#1B74E4] text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Request New Verification Email
                </Link>
                <Link href="/login" className="block w-full text-[#1B74E4] hover:underline">
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-1">
          <BsMeta className="text-gray-600" />
          <p className="text-gray-600">Meta</p>
        </div>
      </div>
    </div>
  )
}

export default VerifyAccount
