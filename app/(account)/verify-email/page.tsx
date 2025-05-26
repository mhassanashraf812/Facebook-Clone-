"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import axios from "axios"
import { toast } from "react-hot-toast"
import Image from "next/image"
import Link from "next/link"
import { BsMeta } from "react-icons/bs"

const VerifyEmailPage = () => {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const emailParam = searchParams?.get("email")
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam))
      setSent(true) // Show success message if coming from registration
    }
  }, [searchParams])

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error("Please enter your email")
      return
    }

    setLoading(true)
    try {
      const response = await axios.post("/api/resend-verification", { email })
      if (response.status === 200) {
        setSent(true)
        toast.success("Verification email sent! Please check your inbox.")
      }
    } catch (error: any) {
      toast.error(error.response?.data || "Failed to send verification email")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full h-screen flex justify-center items-center bg-[#e9ebee]">
      <div className="flex flex-col items-center space-y-10 max-w-md mx-auto">
        <Image src={"/logo.png"} alt="logo" width={48} height={48} />

        <div className="bg-white rounded-lg p-8 shadow-md w-full">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Verify Your Email</h2>

          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Check Your Email!</h3>
              <p className="text-gray-600">
                We've sent a verification link to <strong>{email}</strong>
              </p>
              <p className="text-sm text-gray-500">
                Please check your inbox and click the verification link to activate your account.
              </p>
              <div className="space-y-3 mt-6">
                <button
                  onClick={() => setSent(false)}
                  className="w-full bg-[#1B74E4] text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Resend Verification Email
                </button>
                <Link href="/login" className="block w-full text-center text-[#1B74E4] hover:underline">
                  Back to Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleResendVerification} className="space-y-4">
              <p className="text-gray-600 text-center mb-4">Enter your email address to receive a verification link</p>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B74E4] focus:border-transparent"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#1B74E4] text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send Verification Email"}
              </button>

              <div className="text-center">
                <Link href="/login" className="text-[#1B74E4] hover:underline">
                  Back to Login
                </Link>
              </div>
            </form>
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

export default VerifyEmailPage
