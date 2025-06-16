import { type NextRequest, NextResponse } from "next/server"
import { DashboardService } from "@/services/dashboard-preferences"
import { Types } from "mongoose"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // For demo purposes, we'll create a mock ObjectId from the email
    // In production, you'd get the actual user ObjectId from your auth system
    const objectId = new Types.ObjectId()

    try {
      const preferences = await DashboardService.getUserPreferences(objectId.toString())

      return NextResponse.json({
        success: true,
        preferences,
      })
    } catch (error) {
      // If user preferences don't exist, return empty state
      return NextResponse.json({
        success: true,
        preferences: null,
      })
    }
  } catch (error) {
    console.error("Error in dashboard GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, layout } = body

    if (!userId || !layout) {
      return NextResponse.json({ error: "User ID and layout are required" }, { status: 400 })
    }

    // For demo purposes, we'll create a mock ObjectId from the email
    // In production, you'd get the actual user ObjectId from your auth system
    const objectId = new Types.ObjectId()

    try {
      // Try to get existing preferences
      let preferences = await DashboardService.getUserPreferences(objectId.toString())

      if (!preferences) {
        // Create new preferences with the provided layout
        const defaultPrefs = {
          userId: objectId,
          layouts: [layout],
          activeLayoutName: layout.name,
          globalSettings: {
            theme: "dark" as const,
            autoSave: true,
            refreshInterval: 300,
            compactMode: false,
          },
        }

        // We need to create the preferences manually since the service expects existing preferences
        const { default: DashboardPreferences } = await import("@/models/dashboard-preferences")
        preferences = await DashboardPreferences.create(defaultPrefs)
      } else {
        // Update existing layout or create new one
        const existingLayoutIndex = preferences.layouts.findIndex((l) => l.name === layout.name)

        if (existingLayoutIndex >= 0) {
          // Update existing layout
          preferences.layouts[existingLayoutIndex] = layout
        } else {
          // Add new layout
          preferences.layouts.push(layout)
        }

        // Set as active layout
        preferences.activeLayoutName = layout.name
        await preferences.save()
      }

      return NextResponse.json({
        success: true,
        preferences,
      })
    } catch (error) {
      console.error("Error saving dashboard preferences:", error)
      return NextResponse.json({ error: "Failed to save dashboard preferences" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in dashboard POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
