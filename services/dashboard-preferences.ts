import { Types } from "mongoose"
import DashboardPreferences, { type IDashboardPreferences, type IDashboardLayout } from "@/models/dashboard-preferences"
import connectToDatabase from "@/lib/mongoose"

export class DashboardService {
  static async getUserPreferences(userId: string): Promise<IDashboardPreferences | null> {
    await connectToDatabase()

    let userObjectId: Types.ObjectId

    if (Types.ObjectId.isValid(userId)) {
      userObjectId = new Types.ObjectId(userId)
    } else {
      // Create consistent ObjectId from email/string
      const hash = userId.split("").reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0)
        return a & a
      }, 0)
      const hexString = Math.abs(hash).toString(16).padStart(24, "0").substring(0, 24)
      userObjectId = new Types.ObjectId(hexString)
    }

    return await DashboardPreferences.findOne({ userId: userObjectId })
  }

  static async createOrUpdatePreferences(userId: string, layout: IDashboardLayout): Promise<IDashboardPreferences> {
    await connectToDatabase()

    let userObjectId: Types.ObjectId

    if (Types.ObjectId.isValid(userId)) {
      userObjectId = new Types.ObjectId(userId)
    } else {
      const hash = userId.split("").reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0)
        return a & a
      }, 0)
      const hexString = Math.abs(hash).toString(16).padStart(24, "0").substring(0, 24)
      userObjectId = new Types.ObjectId(hexString)
    }

    let preferences = await DashboardPreferences.findOne({ userId: userObjectId })

    if (!preferences) {
      // Create new preferences
      preferences = await DashboardPreferences.create({
        userId: userObjectId,
        layouts: [layout],
        activeLayoutName: layout.name,
        globalSettings: {
          theme: "dark",
          autoSave: true,
          refreshInterval: 300,
          compactMode: false,
        },
      })
    } else {
      // Update existing preferences
      const existingLayoutIndex = preferences.layouts.findIndex((l:any) => l.name === layout.name)

      if (existingLayoutIndex >= 0) {
        preferences.layouts[existingLayoutIndex] = layout
      } else {
        preferences.layouts.push(layout)
      }

      preferences.activeLayoutName = layout.name
      await preferences.save()
    }

    return preferences
  }

  static async deleteLayout(userId: string, layoutName: string): Promise<IDashboardPreferences> {
    await connectToDatabase()

    let userObjectId: Types.ObjectId

    if (Types.ObjectId.isValid(userId)) {
      userObjectId = new Types.ObjectId(userId)
    } else {
      const hash = userId.split("").reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0)
        return a & a
      }, 0)
      const hexString = Math.abs(hash).toString(16).padStart(24, "0").substring(0, 24)
      userObjectId = new Types.ObjectId(hexString)
    }

    const preferences = await DashboardPreferences.findOne({ userId: userObjectId })

    if (!preferences) {
      throw new Error("User preferences not found")
    }

    return await preferences.deleteLayout(layoutName)
  }
}
