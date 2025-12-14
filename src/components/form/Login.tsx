"use client"

import type React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Lock, Mail, Heart } from "lucide-react"

import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"

import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

type LoginType = "patient" | "staff"

//  ***Login Accounts for testing: testid@gmail.com / 11032005***


const loginSchema = yup.object({
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email format"),

  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
})

type LoginFormValues = yup.InferType<typeof loginSchema>


export default function Login() {
  const [loginType, setLoginType] = useState<LoginType>("patient")
  const [error, setError] = useState("")

  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    setError("")
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password)

      console.log("Login successful:", loginType)

      if (loginType === "patient") {
        navigate("/")
      } else {
        navigate("/staff-dashboard")
      }
    } catch (err: any) {
      setError(err.message || "Login failed")
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header /> 

      <main className="flex-1 flex items-center justify-center py-12 px-4 bg-linear-to-br from-blue-50 via-white to-blue-50">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
              <Heart className="w-8 h-8 text-white fill-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">
              Sign in to access your healthcare account
            </p>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-1 pb-4">
              {/* Login type */}
              <div className="flex gap-2 p-1 bg-gray-100 rounded-lg mb-4">
                <button
                  type="button"
                  onClick={() => setLoginType("patient")}
                  className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all ${
                    loginType === "patient"
                      ? "bg-white text-primary shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Patient Login
                </button>

                <button
                  type="button"
                  onClick={() => setLoginType("staff")}
                  className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all ${
                    loginType === "staff"
                      ? "bg-white text-primary shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Staff Login
                </button>
              </div>

              <CardTitle className="text-2xl">
                {loginType === "patient"
                  ? "Patient Portal"
                  : "Staff Portal"}
              </CardTitle>

              <CardDescription>
                {loginType === "patient"
                  ? "Access your medical records, appointments, and prescriptions"
                  : "Access patient records, schedules, and administrative tools"}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {error && (
                  <div className="text-red-500 text-sm text-center">
                    {error}
                  </div>
                )}

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      className="pl-10"
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      className="pl-10"
                      {...register("password")}
                    />
                  </div>

                  {errors.password && (
                    <p className="text-sm text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Remember */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Remember me for 30 days
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-base"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing In..." : "Sign In"}
                </Button>

                {loginType === "patient" && (
                  <div className="text-center pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      Don't have an account?{" "}
                      <Link
                        to="/register"
                        className="text-primary font-medium hover:underline"
                      >
                        Register now
                      </Link>
                    </p>
                  </div>
                )}

                {loginType === "staff" && (
                  <div className="text-center pt-4">
                    <p className="text-xs text-gray-500">
                      Staff login is restricted. Contact IT support for access.
                    </p>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Need help? Contact us at{" "}
              <a
                href="tel:+15551234567"
                className="text-primary hover:underline"
              >
                (555) 123-4567
              </a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
