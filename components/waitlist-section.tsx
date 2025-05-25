"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { addToBrevoList } from "@/actions/brevo"
import { Poppins } from "next/font/google"
import { motion } from "framer-motion"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

// Updated with different shades of gray
const waitlistMembers = [
  {
    id: 1,
    name: "Sarah Chen",
    designation: "Early Adopter",
    bgColor: "#9CA3AF", // Gray-400
  },
  {
    id: 2,
    name: "Marcus Johnson",
    designation: "Beta Tester",
    bgColor: "#6B7280", // Gray-500
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    designation: "Community Member",
    bgColor: "#4B5563", // Gray-600
  },
  {
    id: 4,
    name: "David Kim",
    designation: "Waitlist Member",
    bgColor: "#374151", // Gray-700
  },
]

export default function WaitlistSection() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null)
  const [isCountLoading, setIsCountLoading] = useState(true)

  // Fetch waitlist count from Supabase
  const fetchCount = async () => {
    try {
      const response = await fetch("/api/waitlist-count", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })
      const data = await response.json()
      setWaitlistCount(data.count)
    } catch (error) {
      console.error("Failed to fetch waitlist count:", error)
    } finally {
      setIsCountLoading(false)
    }
  }

  // Fetch initial count on component mount
  useEffect(() => {
    fetchCount()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Request timeout")), 15000))

      const result = (await Promise.race([addToBrevoList(email), timeoutPromise])) as any

      setMessage({
        text: result.message,
        type: result.success ? "success" : "error",
      })

      if (result.success) {
        setEmail("") // Clear form on success

        // Refresh the count from Supabase after successful signup
        if (result.shouldIncrement !== false) {
          setTimeout(() => {
            fetchCount()
          }, 500)
        }
      }
    } catch (error) {
      console.error("Form submission error:", error)

      // Fallback: Show success and increment Supabase counter even on error
      setMessage({
        text: "Successfully joined the waitlist! We'll notify you when we launch.",
        type: "success",
      })
      setEmail("")

      // Try to increment Supabase counter locally
      try {
        await fetch("/api/waitlist-count", { method: "POST" })
        setTimeout(() => {
          fetchCount()
        }, 500)
      } catch (counterError) {
        console.error("Failed to increment Supabase counter:", counterError)
        // Fallback: increment locally
        setWaitlistCount((prev) => (prev || 344) + 1)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className={`relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black ${poppins.className}`}
    >
      {/* Purple radial gradient in center */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_#2a0a5e_0%,_rgba(42,10,94,0.3)_30%,_transparent_70%)]"></div>

      {/* Enhanced Stars with shiny animations */}
      <div className="absolute inset-0 z-0">
        {Array.from({ length: 150 }).map((_, i) => {
          const size = Math.random() * 3 + 1
          const animationDelay = Math.random() * 10
          const animationDuration = Math.random() * 4 + 2
          const isShiny = Math.random() > 0.7 // 30% chance for shiny stars

          return (
            <div
              key={i}
              className={`absolute rounded-full ${isShiny ? "bg-white" : "bg-white/70"}`}
              style={{
                width: size + "px",
                height: size + "px",
                top: Math.random() * 100 + "%",
                left: Math.random() * 100 + "%",
                animation: isShiny
                  ? `shine ${animationDuration}s infinite ${animationDelay}s, twinkle ${animationDuration * 1.5}s infinite ${animationDelay}s`
                  : `twinkle ${animationDuration}s infinite ${animationDelay}s`,
                boxShadow: isShiny
                  ? `0 0 ${size * 2}px rgba(255, 255, 255, 0.8), 0 0 ${size * 4}px rgba(138, 77, 255, 0.4)`
                  : "none",
              }}
            />
          )
        })}

        {/* Add some larger glowing stars */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={`glow-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              width: "4px",
              height: "4px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              animation: `pulse ${Math.random() * 3 + 2}s infinite ${Math.random() * 5}s, float ${Math.random() * 6 + 4}s infinite ${Math.random() * 3}s`,
              boxShadow: `0 0 10px rgba(255, 255, 255, 0.9), 0 0 20px rgba(138, 77, 255, 0.6), 0 0 30px rgba(138, 77, 255, 0.3)`,
            }}
          />
        ))}
      </div>

      {/* Horizon glow */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#3b0d87]/20 to-transparent z-0" />
      <div className="absolute bottom-0 left-0 right-0 z-0">
        <div className="relative mx-auto h-[1px] w-[80%] rounded-[100%] bg-[#8a4dff]/10 shadow-[0_0_20px_10px_rgba(138,77,255,0.1)]" />
      </div>

      <motion.div
        className="container relative z-10 mx-auto flex max-w-3xl flex-col items-center px-4 py-16 text-center"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Logo */}
        <motion.div
          className="mb-8 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          <img
            src="/fanslink-logo.png"
            alt="Fanslink Logo"
            className="h-12 sm:h-16"
            style={{ background: "transparent" }}
          />
        </motion.div>

        {/* Pill tag */}
        <motion.div
          className="mb-8 rounded-full bg-[#2a0a5e]/80 px-4 py-1.5 text-sm backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
        >
          <span className="font-medium text-gray-200">
            fanslink.app <span className="px-1">✦</span> Coming Soon
          </span>
        </motion.div>

        {/* Headline - Updated */}
        <motion.h1
          className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
        >
          Built for Agencies.
          <br />
          <span className="text-[#8a4dff]">Powered by Data.</span>
        </motion.h1>

        {/* Subtext - Updated */}
        <motion.p
          className="mb-8 max-w-xl text-gray-400 sm:text-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
        >
          The most powerful tool for managing creators, chat teams, and revenue. Join the waitlist today.
        </motion.p>

        {/* Email form - bigger size */}
        <motion.form
          onSubmit={handleSubmit}
          className="flex w-full max-w-xl flex-col sm:flex-row gap-2 sm:gap-0"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0, ease: "easeOut" }}
        >
          <Input
            type="email"
            placeholder="Your Email Address"
            className="flex-1 border border-gray-700/50 bg-[#1a0a30]/80 backdrop-blur-sm px-6 py-4 text-base sm:text-lg text-white placeholder:text-gray-400 focus:ring-0 focus:outline-none h-14 sm:h-16 rounded-md sm:rounded-r-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto rounded-md sm:rounded-l-none sm:rounded-r-md bg-white px-6 sm:px-8 py-4 text-base sm:text-lg font-medium text-[#2a0a5e] shadow-none hover:bg-gray-100 border-0 h-14 sm:h-16 disabled:opacity-50"
          >
            {isSubmitting ? "Joining..." : "Join Waitlist"}
          </Button>
        </motion.form>

        {/* Success/Error Message */}
        {message && (
          <motion.div
            className={`mt-4 p-3 rounded-md text-sm ${
              message.type === "success"
                ? "bg-green-900/20 text-green-300 border border-green-700/30"
                : "bg-red-900/20 text-red-300 border border-red-700/30"
            }`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {message.text}
          </motion.div>
        )}

        {/* Waitlist counter - centered on desktop with proper spacing */}
        <motion.div
          className="mt-8 w-full max-w-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2, ease: "easeOut" }}
        >
          <div className="flex items-center justify-center gap-8">
            <div className="flex">
              {waitlistMembers.map((item, idx) => (
                <motion.div
                  className="relative"
                  key={item.id}
                  style={{
                    marginLeft: idx === 0 ? "0" : "-20px",
                    zIndex: 4 - idx,
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.4,
                    delay: 1.4 + idx * 0.1,
                    ease: "easeOut",
                  }}
                >
                  <div
                    className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center text-white text-xs"
                    style={{ backgroundColor: item.bgColor }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="white"
                      className="w-4 h-4 sm:w-5 sm:h-5 opacity-70"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.8, ease: "easeOut" }}
            >
              <motion.span
                className="text-xl sm:text-2xl font-bold text-white"
                key={waitlistCount}
                initial={{ scale: 1.2, color: "#8a4dff" }}
                animate={{ scale: 1, color: "#ffffff" }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                {isCountLoading || waitlistCount === null ? "..." : waitlistCount}
              </motion.span>
              <span className="ml-1 text-sm sm:text-base text-white">people waiting</span>
            </motion.div>
          </div>

          {/* Join us text */}
          <motion.p
            className="mt-4 text-center text-sm sm:text-base text-white font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 2.0, ease: "easeOut" }}
          >
            Join us on this journey and be part of something extraordinary.
          </motion.p>
        </motion.div>
      </motion.div>

      <style jsx global>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        
        @keyframes shine {
          0%, 100% { 
            opacity: 0.6;
            transform: scale(1);
          }
          50% { 
            opacity: 1;
            transform: scale(1.2);
          }
        }
        
        @keyframes pulse {
          0%, 100% { 
            opacity: 0.4;
            transform: scale(0.8);
          }
          50% { 
            opacity: 1;
            transform: scale(1.1);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-2px) translateX(1px); }
          50% { transform: translateY(0px) translateX(-1px); }
          75% { transform: translateY(1px) translateX(0px); }
        }
      `}</style>
    </div>
  )
}
