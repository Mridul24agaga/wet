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
      return {
        success: false,
        message: "Configuration error. Please contact support.",
      }
    }

    console.log("Attempting to add email to Brevo:", email)

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
    })

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
        return {
          success: true,
          message: "You're already on our waitlist! We'll keep you updated.",
          shouldIncrement: false, // Don't increment for duplicates
        }
      }

      if (response.status === 401) {
        return {
          success: false,
          message: "Authentication error. Please check your API configuration.",
        }
      }

      return {
        success: false,
        message: "Unable to join waitlist. Please try again later.",
      }
    }

    const data = JSON.parse(responseText)
    console.log("Contact added to Brevo successfully:", data)

    // Only increment counter for NEW signups (not updates)
    const shouldIncrement = true

    // Check if this was an update vs new contact
    if (data.id && responseText.includes('"id"')) {
      // This is likely a new contact, increment counter
      try {
        const baseUrl = process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : process.env.NODE_ENV === "development"
            ? "http://localhost:3000"
            : "https://your-domain.com" // Replace with your actual domain

        const counterResponse = await fetch(`${baseUrl}/api/waitlist-count`, {
          method: "POST",
        })

        if (!counterResponse.ok) {
          console.error("Failed to increment counter")
        }
      } catch (error) {
        console.error("Failed to increment counter:", error)
        // Don't fail the whole operation if counter update fails
      }
    }

    return {
      success: true,
      message: "Successfully joined the waitlist! We'll notify you when we launch.",
      shouldIncrement: true,
    }
  } catch (error) {
    console.error("Error adding contact to Brevo:", error)
    return {
      success: false,
      message: "Something went wrong. Please try again later.",
    }
  }
}
