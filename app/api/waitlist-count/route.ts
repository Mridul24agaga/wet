import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Get the current count from Supabase
    const { data, error } = await supabase.from("waitlist_counter").select("count").eq("id", 1).single()

    if (error) {
      console.error("Error fetching count:", error)
      // If no record exists, create one with initial count
      if (error.code === "PGRST116") {
        const { data: newData, error: insertError } = await supabase
          .from("waitlist_counter")
          .insert({ id: 1, count: 344 })
          .select("count")
          .single()

        if (insertError) {
          console.error("Error creating initial count:", insertError)
          return NextResponse.json({ count: 344 })
        }
        return NextResponse.json({ count: newData.count })
      }
      return NextResponse.json({ count: 344 })
    }

    return NextResponse.json({ count: data.count })
  } catch (error) {
    console.error("Failed to get count:", error)
    return NextResponse.json({ count: 344 })
  }
}

export async function POST() {
  try {
    // Increment the count in Supabase using the RPC function
    const { data, error } = await supabase.rpc("increment_waitlist_count")

    if (error) {
      console.error("Error incrementing count:", error)
      return NextResponse.json({ count: 344 }, { status: 500 })
    }

    return NextResponse.json({ count: data })
  } catch (error) {
    console.error("Failed to increment count:", error)
    return NextResponse.json({ count: 344 }, { status: 500 })
  }
}
