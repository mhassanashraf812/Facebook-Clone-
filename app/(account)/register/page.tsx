"use client"
import { Input } from "@components"
import axios from "axios"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type React from "react"
import { type ChangeEvent, useRef, useState } from "react"
import { toast } from "react-hot-toast"
import { BsMeta } from "react-icons/bs"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"

const Register = () => {
  const date = useRef<HTMLInputElement | null>(null)
  const name = useRef<HTMLInputElement>()
  const email = useRef<HTMLInputElement | null>(null)
  const password = useRef<HTMLInputElement | null>(null)
  const [gender, setGender] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [ageError, setAgeError] = useState("")
  const router = useRouter()

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    return age
  }

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value
    if (selectedDate) {
      const age = calculateAge(selectedDate)
      if (age < 13) {
        setAgeError("You must be at least 13 years old to register")
      } else {
        setAgeError("")
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Validate age before submission
    if (date.current?.value) {
      const age = calculateAge(date.current.value)
      if (age < 13) {
        toast.error("You must be at least 13 years old to register")
        return
      }
    }

    // Validate password strength
    const passwordValue = password.current?.value || ""
    if (passwordValue.length < 8) {
      toast.error("Password must be at least 8 characters long")
      return
    }

    try {
      setLoading(true)
      const response = await axios.post("/api/register", {
        name: name.current?.value,
        email: email.current?.value,
        password: password.current?.value,
        dob: date.current?.value,
        gender,
      })
      if (response.status == 201) {
        toast.success(response.data)
        router.push(`/verify-email?email=${encodeURIComponent(email.current?.value || "")}`)
      }
    } catch (error: any) {
      toast.error(error.response?.data || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="flex flex-col items-center space-y-8 w-full max-w-md mx-4">
        {/* Logo and Header */}
        <div className="text-center">
          <Image src={"/logo.png"} alt="logo" width={64} height={64} className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
          <p className="text-gray-600">Join Facebook to connect with friends and family</p>
        </div>

        {/* Registration Form */}
        <div className="w-full bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <Input id="name" type="text" label="Full Name" refer={name} />
            </div>

            {/* Email */}
            <div>
              <Input id="email" type="email" label="Email Address" refer={email} />
            </div>

            {/* Password */}
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                label="Password (8+ characters)"
                refer={password}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-6 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
              </button>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
              <input
                required
                type="date"
                ref={date}
                onChange={handleDateChange}
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split("T")[0]}
                className="w-full rounded-lg border border-gray-300 py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {ageError && <p className="text-red-500 text-sm mt-1">{ageError}</p>}
              <p className="text-xs text-gray-500 mt-1">You must be at least 13 years old</p>
            </div>

            {/* Gender Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Gender</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "custom", label: "Custom" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      gender === option.value
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={option.value}
                      checked={gender === option.value}
                      onChange={(e) => setGender(e.target.value)}
                      className="sr-only"
                    />
                    <span className="font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Terms and Privacy */}
            <div className="text-xs text-gray-600 text-center">
              By clicking Create Account, you agree to our{" "}
              <Link href="#" className="text-blue-600 hover:underline">
                Terms
              </Link>
              ,{" "}
              <Link href="#" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-blue-600 hover:underline">
                Cookies Policy
              </Link>
              .
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || ageError !== ""}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>

            {/* Login Link */}
            <div className="text-center pt-4">
              <p className="text-gray-600 mb-3">Already have an account?</p>
              <Link href="/login">
                <button
                  type="button"
                  className="w-full bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                >
                  Sign In
                </button>
              </Link>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 text-gray-500">
          <BsMeta className="text-gray-600" />
          <p className="text-sm">Meta</p>
        </div>
      </div>
    </div>
  )
}

export default Register
