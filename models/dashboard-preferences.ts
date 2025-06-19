import mongoose, { Schema, type Document, type Types } from "mongoose"

export interface IWidgetConfig {
  color?: string
  backgroundColor?: string
  // Chart specific
  chartType?: string
  data?: Array<{ name: string; value: number; [key: string]: any }>
  xAxis?: string
  yAxis?: string
  colors?: string[]
  // Table specific (basic table)
  columns?: Array<{
    id: string
    label: string
    type: "text" | "number" | "date" | "badge" | "currency" | "percentage"
    color?: string
    sortable?: boolean
    filterable?: boolean
    width?: number
  }>
  showHeaders?: boolean
  alternateRows?: boolean
  borderColor?: string
  // Advanced Data Table specific
  pagination?: {
    enabled: boolean
    pageSize: number
    currentPage: number
    showSizeSelector: boolean
    pageSizeOptions: number[]
  }
  filters?: {
    enabled: boolean
    globalSearch: boolean
    columnFilters: boolean
    dateRange: boolean
  }
  sorting?: {
    enabled: boolean
    multiSort: boolean
    defaultSort: { column: string; direction: "asc" | "desc" }
  }
  infiniteScroll?: boolean
  virtualScrolling?: boolean
  exportOptions?: string[]
  selectable?: boolean
  expandable?: boolean
  // Metric specific
  value?: string
  label?: string
  change?: string
  changeColor?: string
  showTrend?: boolean
  prefix?: string
  suffix?: string
  // Card specific
  message?: string
  showIcon?: boolean
  iconType?: string
  textAlign?: "left" | "center" | "right"
  // Calendar specific
  showWeekends?: boolean
  highlightToday?: boolean
  events?: Array<{ date: string; title: string; color?: string }>
  theme?: "default" | "minimal" | "colorful"
  // Generic properties
  [key: string]: any
}

export interface IDashboardWidget {
  id: string
  type: "chart" | "calendar" | "card" | "metric" | "table" | "data-table"
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
  maxW?: number
  maxH?: number
  isResizable?: boolean
  isDraggable?: boolean
  title?: string
  config?: IWidgetConfig
}

export interface IDashboardLayout {
  name: string
  isDefault?: boolean
  widgets: IDashboardWidget[]
  gridCols: number
  gridRowHeight: number
  margin?: [number, number]
  containerPadding?: [number, number]
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

const WidgetConfigSchema = new Schema(
  {
    color: { type: String, default: "from-blue-500 to-blue-700" },
    backgroundColor: { type: String, default: "bg-blue-500/20" },
    // Chart specific
    chartType: { type: String },
    data: [{ type: Schema.Types.Mixed }],
    xAxis: { type: String },
    yAxis: { type: String },
    colors: [{ type: String }],
    // Table specific (basic and advanced)
columns: [
  {
    id: { type: String },
    label: { type: String },
    type: { 
      type: String, 
      enum: ["text", "number", "date", "badge", "currency", "percentage"] // ✅ Added currency
    },
    color: { type: String },
    sortable: { type: Boolean, default: true },
    filterable: { type: Boolean, default: true },
    width: { type: Number },
  },
],
    showHeaders: { type: Boolean, default: true },
    alternateRows: { type: Boolean, default: true },
    borderColor: { type: String, default: "#374151" },
    // Advanced Data Table specific
    pagination: {
      enabled: { type: Boolean, default: true },
      pageSize: { type: Number, default: 10 },
      currentPage: { type: Number, default: 1 },
      showSizeSelector: { type: Boolean, default: true },
      pageSizeOptions: [{ type: Number }],
    },
    filters: {
      enabled: { type: Boolean, default: true },
      globalSearch: { type: Boolean, default: true },
      columnFilters: { type: Boolean, default: true },
      dateRange: { type: Boolean, default: true },
    },
    sorting: {
      enabled: { type: Boolean, default: true },
      multiSort: { type: Boolean, default: true },
      defaultSort: {
        column: { type: String },
        direction: { type: String, enum: ["asc", "desc"], default: "asc" },
      },
    },
    infiniteScroll: { type: Boolean, default: false },
    virtualScrolling: { type: Boolean, default: true },
    exportOptions: [{ type: String }],
    selectable: { type: Boolean, default: true },
    expandable: { type: Boolean, default: false },
    // Metric specific
    value: { type: String },
    label: { type: String },
    change: { type: String },
    changeColor: { type: String, default: "#10b981" },
    showTrend: { type: Boolean, default: true },
    prefix: { type: String, default: "" },
    suffix: { type: String, default: "" },
    // Card specific
    message: { type: String },
    showIcon: { type: Boolean, default: true },
    iconType: { type: String, default: "info" },
    textAlign: { type: String, enum: ["left", "center", "right"], default: "center" },
    // Calendar specific
    showWeekends: { type: Boolean, default: true },
    highlightToday: { type: Boolean, default: true },
    events: [
      {
        date: { type: String },
        title: { type: String },
        color: { type: String },
      },
    ],
    theme: { type: String, enum: ["default", "minimal", "colorful"], default: "default" },
  },
  { strict: false, _id: false },
)

const WidgetSchema = new Schema(
  {
    id: { type: String, required: true },
    type: {
  type: String,
  required: true,
  enum: ["chart", "calendar", "card", "metric", "table", "data-table"], // ✅ data-table included
},
    x: { type: Number, required: true, default: 0 },
    y: { type: Number, required: true, default: 0 },
    w: { type: Number, required: true, default: 1 },
    h: { type: Number, required: true, default: 1 },
    minW: { type: Number, default: 1 },
    minH: { type: Number, default: 1 },
    maxW: { type: Number, default: 12 },
    maxH: { type: Number, default: 12 },
    isResizable: { type: Boolean, default: true },
    isDraggable: { type: Boolean, default: true },
    title: { type: String },
    config: { type: WidgetConfigSchema, default: {} },
  },
  { _id: false },
)

const DashboardLayoutSchema = new Schema(
  {
    name: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
    widgets: [WidgetSchema],
    gridCols: { type: Number, default: 12 },
    gridRowHeight: { type: Number, default: 150 },
    margin: { type: [Number], default: [10, 10] },
    containerPadding: { type: [Number], default: [10, 10] },
  },
  { _id: false },
)

const DashboardPreferencesSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    layouts: { type: [DashboardLayoutSchema], default: [] },
    activeLayoutName: { type: String, default: "default" },
    globalSettings: {
      type: {
        theme: { type: String, default: "dark" },
        autoSave: { type: Boolean, default: true },
        refreshInterval: { type: Number, default: 300 },
        compactMode: { type: Boolean, default: false },
      },
      default: {
        theme: "dark",
        autoSave: true,
        refreshInterval: 300,
        compactMode: false,
      },
    },
  },
  {
    timestamps: true,
  },
)

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
