import { type NextRequest, NextResponse } from "next/server"
import { Types } from "mongoose"
import DashboardPreferences from "@/models/dashboard-preferences"
import connectToDatabase from "@/lib/mongoose"
import { isMongooseValidationError, getErrorMessage } from "@/lib/error-utils"

// Helper function to create consistent ObjectId from string
function createConsistentObjectId(input: string): Types.ObjectId {
  const hash = input.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0)
    return a & a
  }, 0)
  const hexString = Math.abs(hash).toString(16).padStart(24, "0").substring(0, 24)
  return new Types.ObjectId(hexString)
}

// Connect to database
async function ensureDBConnection() {
  try {
    await connectToDatabase()
  } catch (error: unknown) {
    console.error("Database connection error:", error)
    throw new Error("Database connection failed")
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureDBConnection()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    console.log("GET Request - userId from params:", userId)

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Convert userId to ObjectId - handle both email and actual ObjectId
    let userObjectId: Types.ObjectId

    if (Types.ObjectId.isValid(userId)) {
      userObjectId = new Types.ObjectId(userId)
    } else {
      userObjectId = createConsistentObjectId(userId)
    }

    console.log("GET Request - Generated ObjectId:", userObjectId.toString())

    try {
      const preferences = await DashboardPreferences.findOne({ userId: userObjectId })

      console.log("GET Request - Found preferences:", preferences ? "Yes" : "No")
      if (preferences) {
        console.log("GET Request - Preferences data:", {
          userId: preferences.userId,
          layoutsCount: preferences.layouts?.length || 0,
          activeLayoutName: preferences.activeLayoutName,
        })
      }

      return NextResponse.json({
        success: true,
        preferences,
        debug: {
          requestedUserId: userId,
          generatedObjectId: userObjectId.toString(),
          foundPreferences: !!preferences,
        },
      })
    } catch (error: unknown) {
      console.error("Error fetching preferences:", getErrorMessage(error))
      return NextResponse.json({
        success: false,
        preferences: null,
        error: getErrorMessage(error),
      })
    }
  } catch (error: unknown) {
    console.error("Error in dashboard GET:", getErrorMessage(error))
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDBConnection()

    const body = await request.json()
    const { userId, layout } = body

    console.log("POST Request - userId:", userId)
    console.log("POST Request - layout name:", layout?.name)

    if (!userId || !layout) {
      return NextResponse.json(
        {
          error: "User ID and layout are required",
        },
        { status: 400 },
      )
    }

    // Convert userId to ObjectId - same logic as GET
    let userObjectId: Types.ObjectId

    if (Types.ObjectId.isValid(userId)) {
      userObjectId = new Types.ObjectId(userId)
    } else {
      userObjectId = createConsistentObjectId(userId)
    }

    console.log("POST Request - Generated ObjectId:", userObjectId.toString())

    try {
      // Find existing preferences
      let preferences = await DashboardPreferences.findOne({ userId: userObjectId })

      console.log("POST Request - Found existing preferences:", preferences ? "Yes" : "No")

      if (!preferences) {
        // Create new preferences document
        const newPreferences = {
          userId: userObjectId,
          layouts: [layout],
          activeLayoutName: layout.name,
          globalSettings: {
            theme: "dark",
            autoSave: true,
            refreshInterval: 300,
            compactMode: false,
          },
        }

        console.log("POST Request - Creating new preferences:", newPreferences)
        preferences = await DashboardPreferences.create(newPreferences)
        console.log("POST Request - Created preferences with ID:", preferences._id)
      } else {
        // Update existing preferences
        const existingLayoutIndex = preferences.layouts.findIndex((l: any) => l.name === layout.name)

        if (existingLayoutIndex >= 0) {
          // Update existing layout
          console.log("POST Request - Updating existing layout at index:", existingLayoutIndex)
          preferences.layouts[existingLayoutIndex] = layout
        } else {
          // Add new layout
          console.log("POST Request - Adding new layout")
          preferences.layouts.push(layout)
        }

        preferences.activeLayoutName = layout.name
        await preferences.save()
        console.log("POST Request - Updated preferences")
      }

      return NextResponse.json({
        success: true,
        preferences,
        debug: {
          requestedUserId: userId,
          generatedObjectId: userObjectId.toString(),
          operation: preferences.isNew ? "created" : "updated",
          layoutsCount: preferences.layouts?.length || 0,
        },
      })
    } catch (error: unknown) {
      console.error("Error saving dashboard preferences:", getErrorMessage(error))

      // Handle mongoose validation errors
      if (isMongooseValidationError(error)) {
        const validationErrors = Object.keys(error.errors).map((key) => ({
          field: key,
          message: error.errors[key].message,
        }))

        return NextResponse.json(
          {
            error: "Validation failed",
            details: validationErrors,
          },
          { status: 400 },
        )
      }

      return NextResponse.json(
        {
          error: "Failed to save dashboard preferences",
          message: getErrorMessage(error),
        },
        { status: 500 },
      )
    }
  } catch (error: unknown) {
    console.error("Error in dashboard POST:", getErrorMessage(error))
    return NextResponse.json(
      {
        error: "Internal server error",
        message: getErrorMessage(error),
      },
      { status: 500 },
    )
  }
}
