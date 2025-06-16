import mongoose, { Schema, type Document, type Types } from "mongoose"

export interface IDashboardLayout {
  name: string
  data: any // Flexible type for layout data
}

export interface IDashboardGlobalSettings {
  theme: string
  autoSave: boolean
  refreshInterval: number
  compactMode: boolean
}

export interface IDashboardPreferences extends Document {
  userId: Types.ObjectId
  layouts: IDashboardLayout[]
  activeLayoutName: string
  globalSettings: IDashboardGlobalSettings
  deleteLayout: (layoutName: string) => Promise<IDashboardPreferences>
}

const DashboardPreferencesSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  layouts: { type: [Object], default: [] },
  activeLayoutName: { type: String, default: "default" },
  globalSettings: {
    type: Object,
    default: {
      theme: "dark",
      autoSave: true,
      refreshInterval: 300,
      compactMode: false,
    },
  },
})

DashboardPreferencesSchema.methods.deleteLayout = async function (layoutName: string): Promise<IDashboardPreferences> {
  this.layouts = this.layouts.filter((layout: IDashboardLayout) => layout.name !== layoutName)

  if (this.activeLayoutName === layoutName) {
    this.activeLayoutName = this.layouts.length > 0 ? this.layouts[0].name : "default"
  }

  await this.save()
  return this as IDashboardPreferences
}

const DashboardPreferences =
  mongoose.models.DashboardPreferences ||
  mongoose.model<IDashboardPreferences>("DashboardPreferences", DashboardPreferencesSchema)

export default DashboardPreferences
