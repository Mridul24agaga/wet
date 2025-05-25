import { NextResponse } from "next/server"

// Simple file-based storage for persistence across server restarts
// In production, you'd use a proper database
const fs = require("fs").promises
const path = require("path")

const COUNTER_FILE = path.join(process.cwd(), "waitlist-count.json")

async function getCount() {
  try {
    const data = await fs.readFile(COUNTER_FILE, "utf8")
    const { count } = JSON.parse(data)
    return count
  } catch (error) {
    // If file doesn't exist, start with 344
    const initialCount = 344
    await saveCount(initialCount)
    return initialCount
  }
}

async function saveCount(count: number) {
  try {
    await fs.writeFile(COUNTER_FILE, JSON.stringify({ count, lastUpdated: new Date().toISOString() }))
  } catch (error) {
    console.error("Failed to save count:", error)
  }
}

export async function GET() {
  try {
    const count = await getCount()
    return NextResponse.json({ count })
  } catch (error) {
    console.error("Failed to get count:", error)
    return NextResponse.json({ count: 344 }) // Fallback
  }
}

export async function POST() {
  try {
    const currentCount = await getCount()
    const newCount = currentCount + 1
    await saveCount(newCount)
    return NextResponse.json({ count: newCount })
  } catch (error) {
    console.error("Failed to increment count:", error)
    return NextResponse.json({ count: 344 }, { status: 500 })
  }
}
