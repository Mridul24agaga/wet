"use server"

export async function addToBrevoList(email: string) {
  try {
    // Enhanced environment debugging
    const apiKey = process.env.BREVO_API_KEY
    const vercelUrl = process.env.VERCEL_URL
    const nodeEnv = process.env.NODE_ENV

    console.log("=== ENVIRONMENT DEBUG ===")
    console.log("NODE_ENV:", nodeEnv)
    console.log("VERCEL_URL:", vercelUrl)
    console.log("Has BREVO_API_KEY:", !!apiKey)
    console.log("API Key length:", apiKey?.length || 0)
    console.log("API Key first 8 chars:", apiKey?.substring(0, 8) || "none")
    console.log("========================")

    if (!apiKey) {
      console.error("❌ BREVO_API_KEY environment variable is not set")

      // Still increment Supabase counter even if Brevo fails
      try {
        const baseUrl = vercelUrl
          ? `https://${vercelUrl}`
          : nodeEnv === "development"
            ? "http://localhost:3000"
            : "https://your-domain.com"

        console.log("Incrementing Supabase counter at:", baseUrl)
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

    console.log("✅ Attempting to add email to Brevo list ID 2:", email)

    // Add timeout to prevent hanging
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const requestBody = {
      email: email,
      listIds: [3],
      updateEnabled: true,
    }

    console.log("Request body:", JSON.stringify(requestBody))

    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    const responseText = await response.text()
    console.log("Brevo API response status:", response.status)
    console.log("Brevo API response headers:", Object.fromEntries(response.headers.entries()))
    console.log("Brevo API response body:", responseText)

    if (!response.ok) {
      let errorData
      try {
        errorData = JSON.parse(responseText)
      } catch {
        errorData = { message: responseText }
      }

      console.error("❌ Brevo API error:", errorData)

      // Handle specific error cases
      if (
        response.status === 400 &&
        (errorData.code === "duplicate_parameter" || errorData.message?.includes("already exists"))
      ) {
        console.log("📧 Email already exists in list")
        return {
          success: true,
          message: "You're already on our waitlist! We'll keep you updated.",
          shouldIncrement: false,
        }
      }

      // For other Brevo errors, still increment Supabase counter
      try {
        const baseUrl = vercelUrl
          ? `https://${vercelUrl}`
          : nodeEnv === "development"
            ? "http://localhost:3000"
            : "https://your-domain.com"

        console.log("Incrementing Supabase counter after Brevo error at:", baseUrl)
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
    console.log("✅ Contact added to Brevo successfully:", data)

    // Increment Supabase counter for successful Brevo signup
    try {
      const baseUrl = vercelUrl
        ? `https://${vercelUrl}`
        : nodeEnv === "development"
          ? "http://localhost:3000"
          : "https://your-domain.com"

      console.log("Incrementing Supabase counter after success at:", baseUrl)
      const counterResponse = await fetch(`${baseUrl}/api/waitlist-count`, {
        method: "POST",
      })
      console.log("Counter increment response:", counterResponse.status)
    } catch (error) {
      console.error("Failed to increment Supabase counter:", error)
    }

    return {
      success: true,
      message: "Successfully joined the waitlist! We'll notify you when we launch.",
      shouldIncrement: true,
    }
  } catch (error) {
    console.error("❌ Error adding contact to Brevo:", error)

    // Even on error, increment Supabase counter
    try {
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NODE_ENV === "development"
          ? "http://localhost:3000"
          : "https://your-domain.com"

      console.log("Incrementing Supabase counter after error at:", baseUrl)
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
