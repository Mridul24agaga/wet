"use server"

export async function addToBrevoList(email: string) {
  try {
    // Check if API key exists
    const apiKey = process.env.BREVO_API_KEY

    console.log("Environment check:", {
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length || 0,
      apiKeyStart: apiKey?.substring(0, 4) || "none",
    })

    if (!apiKey) {
      console.error("BREVO_API_KEY environment variable is not set")

      // Still increment Supabase counter even if Brevo fails
      try {
        const baseUrl = process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : process.env.NODE_ENV === "development"
            ? "http://localhost:3000"
            : "https://your-domain.com"

        await fetch(`${baseUrl}/api/waitlist-count`, {
          method: "POST",
        })
      } catch (error) {
        console.error("Failed to increment Supabase counter:", error)
      }

      return {
        success: true,
        message: "Successfully joined the waitlist! We'll notify you when we launch.",
        shouldIncrement: true,
      }
    }

    console.log("Attempting to add email to Brevo:", email)

    // Add timeout to prevent hanging
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        email: email,
        listIds: [3], // Your list ID
        updateEnabled: true, // Update contact if already exists
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    const responseText = await response.text()
    console.log("Brevo API response status:", response.status)
    console.log("Brevo API response:", responseText)

    if (!response.ok) {
      let errorData
      try {
        errorData = JSON.parse(responseText)
      } catch {
        errorData = { message: responseText }
      }

      console.error("Brevo API error:", errorData)

      // Handle specific error cases
      if (response.status === 400 && errorData.code === "duplicate_parameter") {
        // Don't increment counter for duplicates
        return {
          success: true,
          message: "You're already on our waitlist! We'll keep you updated.",
          shouldIncrement: false,
        }
      }

      // For other Brevo errors, still increment Supabase counter
      try {
        const baseUrl = process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : process.env.NODE_ENV === "development"
            ? "http://localhost:3000"
            : "https://your-domain.com"

        await fetch(`${baseUrl}/api/waitlist-count`, {
          method: "POST",
        })
      } catch (error) {
        console.error("Failed to increment Supabase counter:", error)
      }

      return {
        success: true,
        message: "Successfully joined the waitlist! We'll notify you when we launch.",
        shouldIncrement: true,
      }
    }

    const data = JSON.parse(responseText)
    console.log("Contact added to Brevo successfully:", data)

    // Increment Supabase counter for successful Brevo signup
    try {
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NODE_ENV === "development"
          ? "http://localhost:3000"
          : "https://your-domain.com"

      await fetch(`${baseUrl}/api/waitlist-count`, {
        method: "POST",
      })
    } catch (error) {
      console.error("Failed to increment Supabase counter:", error)
    }

    return {
      success: true,
      message: "Successfully joined the waitlist! We'll notify you when we launch.",
      shouldIncrement: true,
    }
  } catch (error) {
    console.error("Error adding contact to Brevo:", error)

    // Even on error, increment Supabase counter
    try {
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NODE_ENV === "development"
          ? "http://localhost:3000"
          : "https://your-domain.com"

      await fetch(`${baseUrl}/api/waitlist-count`, {
        method: "POST",
      })
    } catch (counterError) {
      console.error("Failed to increment Supabase counter:", counterError)
    }

    return {
      success: true,
      message: "Successfully joined the waitlist! We'll notify you when we launch.",
      shouldIncrement: true,
    }
  }
}
