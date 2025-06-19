"use client"

import type React from "react"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import type { Layout } from "react-grid-layout"
import {
  Plus,
  Settings,
  Trash2,
  BarChart3,
  Calendar,
  FileText,
  Activity,
  Users,
  DollarSign,
  X,
  Save,
  Palette,
  Type,
} from "lucide-react"
import { AdvancedDataTable } from "@/components/advanced-data-table"
import { AdvancedChart } from "@/components/advanced-chart"

// Dynamically import ReactGridLayout to avoid SSR issues
const ReactGridLayout = dynamic(() => import("react-grid-layout"), { ssr: false })

// Import CSS for react-grid-layout
import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"

interface Widget {
  id: string
  type: string
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
  config?: Record<string, unknown>
}

interface DashboardLayout {
  name: string
  isDefault?: boolean
  widgets: Widget[]
  gridCols: number
  gridRowHeight: number
  margin?: [number, number]
  containerPadding?: [number, number]
}

const WIDGET_TYPES = [
  { type: "chart", title: "Charts & Visualizations", icon: BarChart3, defaultSize: { w: 6, h: 4 }, hasSubTypes: true },
  { type: "data-table", title: "Advanced Data Table", icon: Users, defaultSize: { w: 12, h: 6 } },
  { type: "calendar", title: "Calendar Widget", icon: Calendar, defaultSize: { w: 4, h: 4 } },
  { type: "card", title: "Info Card", icon: FileText, defaultSize: { w: 3, h: 2 } },
  { type: "metric", title: "Metric Widget", icon: Activity, defaultSize: { w: 3, h: 2 } },
]

const CHART_TYPES = [
  { type: "bar", title: "Bar Chart", icon: BarChart3, category: "Basic" },
  { type: "line", title: "Line Chart", icon: Activity, category: "Basic" },
  { type: "area", title: "Area Chart", icon: Activity, category: "Basic" },
  { type: "pie", title: "Pie Chart", icon: DollarSign, category: "Basic" },
  { type: "donut", title: "Donut Chart", icon: DollarSign, category: "Basic" },
  { type: "scatter", title: "Scatter Plot", icon: Activity, category: "Advanced" },
  { type: "bubble", title: "Bubble Chart", icon: Activity, category: "Advanced" },
  { type: "heatmap", title: "Heatmap", icon: Activity, category: "Advanced" },
  { type: "treemap", title: "Treemap", icon: Activity, category: "Advanced" },
  { type: "funnel", title: "Funnel Chart", icon: Activity, category: "Business" },
  { type: "gauge", title: "Gauge Chart", icon: Activity, category: "Business" },
  { type: "waterfall", title: "Waterfall Chart", icon: Activity, category: "Business" },
  { type: "candlestick", title: "Candlestick Chart", icon: Activity, category: "Financial" },
  { type: "radar", title: "Radar Chart", icon: Activity, category: "Comparison" },
  { type: "polar", title: "Polar Chart", icon: Activity, category: "Comparison" },
]

const WIDGET_COLORS = [
  { name: "Blue", value: "from-blue-500 to-blue-700", bg: "bg-blue-500/20" },
  { name: "Purple", value: "from-purple-500 to-purple-700", bg: "bg-purple-500/20" },
  { name: "Green", value: "from-green-500 to-green-700", bg: "bg-green-500/20" },
  { name: "Red", value: "from-red-500 to-red-700", bg: "bg-red-500/20" },
  { name: "Orange", value: "from-orange-500 to-orange-700", bg: "bg-orange-500/20" },
  { name: "Pink", value: "from-pink-500 to-pink-700", bg: "bg-pink-500/20" },
]

const generateSampleData = (count: number) => {
  const roles = ["Admin", "User", "Editor", "Viewer", "Manager", "Analyst", "Developer", "Designer"]
  const statuses = ["Active", "Inactive", "Pending", "Suspended"]
  const departments = ["Engineering", "Marketing", "Sales", "HR", "Finance", "Operations", "Support", "Legal"]
  const companies = ["TechCorp", "DataSys", "CloudNet", "DevTools", "Analytics Pro", "SecureBase", "FastAPI", "WebFlow"]
  const countries = ["USA", "Canada", "UK", "Germany", "France", "Japan", "Australia", "Brazil"]

  const firstNames = [
    "John",
    "Jane",
    "Bob",
    "Alice",
    "Charlie",
    "Diana",
    "Eve",
    "Frank",
    "Grace",
    "Henry",
    "Ivy",
    "Jack",
    "Kate",
    "Liam",
    "Mia",
    "Noah",
    "Olivia",
    "Paul",
    "Quinn",
    "Ruby",
  ]
  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
    "Hernandez",
    "Lopez",
    "Gonzalez",
    "Wilson",
    "Anderson",
    "Thomas",
    "Taylor",
    "Moore",
    "Jackson",
    "Martin",
  ]

  return Array.from({ length: count }, (_, index) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const department = departments[Math.floor(Math.random() * departments.length)]

    return {
      id: index + 1,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${companies[Math.floor(Math.random() * companies.length)].toLowerCase().replace(" ", "")}.com`,
      role: roles[Math.floor(Math.random() * roles.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      created: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      lastLogin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      department,
      company: companies[Math.floor(Math.random() * companies.length)],
      country: countries[Math.floor(Math.random() * countries.length)],
      salary: Math.floor(Math.random() * 150000) + 40000,
      performance: Math.floor(Math.random() * 100) + 1,
      projects: Math.floor(Math.random() * 15) + 1,
      experience: Math.floor(Math.random() * 20) + 1,
      rating: (Math.random() * 4 + 1).toFixed(1),
    }
  })
}

export default function DashboardPage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState("")
  const [userId, setUserId] = useState("")
  const [currentLayout, setCurrentLayout] = useState<DashboardLayout | null>(null)
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddWidget, setShowAddWidget] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [showChartTypes, setShowChartTypes] = useState(false)
  const [selectedChartType, setSelectedChartType] = useState("")

  // Refs to track state and prevent infinite loops
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isUserActionRef = useRef(false)
  const lastSavedLayoutRef = useRef<string>("")

  useEffect(() => {
    const isLoggedIn = localStorage?.getItem("isLoggedIn")
    const email = localStorage?.getItem("userEmail")
    const storedUserId = localStorage?.getItem("userId")

    console.log("Dashboard useEffect - Login check:", {
      isLoggedIn,
      email,
      storedUserId,
    })

    if (!isLoggedIn) {
      router.push("/")
    } else {
      setUserEmail(email || "")
      const effectiveUserId = storedUserId || email || ""
      setUserId(effectiveUserId)
      console.log("Dashboard useEffect - Using userId:", effectiveUserId)
      loadDashboard(effectiveUserId)
    }
  }, [router])

  const loadDashboard = async (userIdToLoad: string) => {
    console.log("loadDashboard called with userId:", userIdToLoad)
    setIsLoading(true)

    try {
      const url = `/api/dashboard?userId=${encodeURIComponent(userIdToLoad)}`
      console.log("loadDashboard - Fetching from URL:", url)

      const response = await fetch(url)
      const data = await response.json()

      console.log("loadDashboard - Response:", data)
      setDebugInfo(data.debug)

      if (response.ok && data.success) {
        if (data.preferences && data.preferences.layouts && data.preferences.layouts.length > 0) {
          const activeLayout =
            data.preferences.layouts.find(
              (layout: DashboardLayout) => layout.name === data.preferences.activeLayoutName,
            ) || data.preferences.layouts[0]

          console.log("loadDashboard - Setting active layout:", activeLayout)
          setCurrentLayout(activeLayout)
          setWidgets(activeLayout.widgets || [])

          // Store the initial layout hash
          const layoutHash = JSON.stringify(
            activeLayout.widgets.map((w: any) => ({ id: w.id, x: w.x, y: w.y, w: w.w, h: w.h })),
          )
          lastSavedLayoutRef.current = layoutHash
        } else {
          console.log("loadDashboard - No preferences found, creating default")
          await createDefaultLayout(userIdToLoad)
        }
      } else {
        console.error("loadDashboard - API error:", data)
        await createDefaultLayout(userIdToLoad)
      }
    } catch (error) {
      console.error("Error loading dashboard:", error)
      await createDefaultLayout(userIdToLoad)
    } finally {
      setIsLoading(false)
    }
  }

  //testing
  const createDefaultLayout = async (userIdToCreate: string) => {
    console.log("createDefaultLayout called with userId:", userIdToCreate)

    const defaultWidgets: Widget[] = [
      {
        id: "welcome-widget",
        type: "card",
        x: 0,
        y: 0,
        w: 6,
        h: 2,
        title: "Welcome",
        config: {
          message: "Welcome to your dashboard!",
          color: "from-blue-500 to-blue-700",
          backgroundColor: "bg-blue-500/20",
        },
      },
      {
        id: "stats-widget",
        type: "metric",
        x: 6,
        y: 0,
        w: 6,
        h: 2,
        title: "Quick Stats",
        config: {
          value: "1,234",
          label: "Total Users",
          change: "+12%",
          color: "from-green-500 to-green-700",
          backgroundColor: "bg-green-500/20",
        },
      },
    ]

    const defaultLayout: DashboardLayout = {
      name: "Default",
      isDefault: true,
      widgets: defaultWidgets,
      gridCols: 12,
      gridRowHeight: 150,
      margin: [10, 10],
      containerPadding: [10, 10],
    }

    setCurrentLayout(defaultLayout)
    setWidgets(defaultWidgets)

    // Store the initial layout hash
    const layoutHash = JSON.stringify(defaultWidgets.map((w) => ({ id: w.id, x: w.x, y: w.y, w: w.w, h: w.h })))
    lastSavedLayoutRef.current = layoutHash

    await saveDashboard(userIdToCreate, defaultLayout)
  }

  const saveDashboard = useCallback(async (userIdToSave: string, layout: DashboardLayout) => {
    console.log("saveDashboard called with:", { userIdToSave, layoutName: layout.name })
    setIsSaving(true)

    try {
      const response = await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userIdToSave,
          layout: layout,
        }),
      })

      const data = await response.json()
      console.log("saveDashboard - Response:", data)

      if (!response.ok) {
        throw new Error(data.error || "Failed to save dashboard")
      }

      // Update the saved layout hash
      const layoutHash = JSON.stringify(layout.widgets.map((w) => ({ id: w.id, x: w.x, y: w.y, w: w.w, h: w.h })))
      lastSavedLayoutRef.current = layoutHash
    } catch (error) {
      console.error("Error saving dashboard:", error)
    } finally {
      setIsSaving(false)
    }
  }, [])

  // Debounced save function
  const debouncedSave = useCallback(
    (layout: DashboardLayout) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveDashboard(userId, layout)
      }, 1000) // 1 second debounce
    },
    [userId, saveDashboard],
  )

  // Handle layout changes from react-grid-layout
  const handleLayoutChange = useCallback(
    (layout: Layout[]) => {
      // Skip if this is a user action (add/remove widget)
      if (isUserActionRef.current) {
        console.log("Skipping layout change - user action in progress")
        return
      }

      if (!currentLayout || !widgets.length) {
        return
      }

      console.log("handleLayoutChange called with", layout.length, "items")

      // Create updated widgets with new positions
      const updatedWidgets = widgets.map((widget) => {
        const layoutItem = layout.find((item) => item.i === widget.id)
        if (layoutItem) {
          return {
            ...widget,
            x: layoutItem.x,
            y: layoutItem.y,
            w: layoutItem.w,
            h: layoutItem.h,
          }
        }
        return widget
      })

      // Check if layout actually changed
      const newLayoutHash = JSON.stringify(updatedWidgets.map((w) => ({ id: w.id, x: w.x, y: w.y, w: w.w, h: w.h })))
      if (newLayoutHash === lastSavedLayoutRef.current) {
        console.log("Layout unchanged, skipping update")
        return
      }

      console.log("Layout changed, updating widgets")

      // Update state
      setWidgets(updatedWidgets)

      const updatedLayout = {
        ...currentLayout,
        widgets: updatedWidgets,
      }

      setCurrentLayout(updatedLayout)

      // Debounced save
      debouncedSave(updatedLayout)
    },
    [widgets, currentLayout, debouncedSave],
  )

  const addWidget = useCallback(
    (widgetType: string, chartType?: string) => {
      console.log("Adding widget:", widgetType, chartType)

      const widgetConfig = WIDGET_TYPES.find((w) => w.type === widgetType)
      if (!widgetConfig || !currentLayout) return

      // Set user action flag
      isUserActionRef.current = true

      const baseConfig = {
        color: "from-blue-500 to-blue-700",
        backgroundColor: "bg-blue-500/20",
      }

      let specificConfig = {}
      let title = widgetConfig.title

      if (widgetType === "chart" && chartType) {
        const chartConfig = CHART_TYPES.find((c) => c.type === chartType)
        title = chartConfig?.title || "Chart"
        specificConfig = {
          chartType,
          data: [
            { name: "Jan", value: 400 },
            { name: "Feb", value: 300 },
            { name: "Mar", value: 600 },
            { name: "Apr", value: 800 },
            { name: "May", value: 500 },
          ],
          xAxis: "name",
          yAxis: "value",
          colors: ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"],
        }
      } else if (widgetType === "data-table") {
        specificConfig = {
          columns: [
            { id: "id", label: "ID", type: "number", sortable: true, filterable: true, width: 60 },
            { id: "name", label: "Name", type: "text", sortable: true, filterable: true, width: 150 },
            { id: "email", label: "Email", type: "text", sortable: true, filterable: true, width: 200 },
            { id: "role", label: "Role", type: "badge", sortable: true, filterable: true, width: 100 },
            { id: "status", label: "Status", type: "badge", sortable: true, filterable: true, width: 90 },
            { id: "department", label: "Department", type: "text", sortable: true, filterable: true, width: 120 },
            { id: "company", label: "Company", type: "text", sortable: true, filterable: true, width: 120 },
            { id: "country", label: "Country", type: "text", sortable: true, filterable: true, width: 100 },
            { id: "salary", label: "Salary", type: "currency", sortable: true, filterable: true, width: 100 },
            { id: "experience", label: "Experience", type: "number", sortable: true, filterable: true, width: 100 },
            { id: "rating", label: "Rating", type: "number", sortable: true, filterable: true, width: 80 },
            { id: "created", label: "Created", type: "date", sortable: true, filterable: true, width: 100 },
          ],
          data: generateSampleData(1000), // Generate 1000 records for demo
          pagination: {
            enabled: false, // Disable pagination when using infinite scroll
            pageSize: 25,
            currentPage: 1,
            showSizeSelector: true,
            pageSizeOptions: [10, 25, 50, 100],
          },
          filters: {
            enabled: true,
            globalSearch: true,
            columnFilters: true,
            dateRange: true,
          },
          sorting: {
            enabled: true,
            multiSort: true,
            defaultSort: { column: "created", direction: "desc" },
          },
          infiniteScroll: true, // Enable infinite scroll
          virtualScrolling: true,
          exportOptions: ["csv", "excel", "pdf"],
          selectable: true,
          expandable: false,
        }
      } else if (widgetType === "table") {
        specificConfig = {
          columns: [
            { id: "name", label: "Name", type: "text", color: "#ffffff" },
            { id: "email", label: "Email", type: "text", color: "#ffffff" },
            { id: "role", label: "Role", type: "text", color: "#ffffff" },
          ],
          data: [
            { name: "John Doe", email: "john@example.com", role: "Admin" },
            { name: "Jane Smith", email: "jane@example.com", role: "User" },
            { name: "Bob Johnson", email: "bob@example.com", role: "Editor" },
          ],
          showHeaders: true,
          alternateRows: true,
          borderColor: "#374151",
        }
      } else if (widgetType === "metric") {
        specificConfig = {
          value: "1,234",
          label: "Total Users",
          change: "+12%",
          changeColor: "#10b981",
          showTrend: true,
          prefix: "",
          suffix: "",
        }
      } else if (widgetType === "card") {
        specificConfig = {
          message: "Welcome to your dashboard!",
          showIcon: true,
          iconType: "info",
          textAlign: "center",
        }
      } else if (widgetType === "calendar") {
        specificConfig = {
          showWeekends: true,
          highlightToday: true,
          events: [],
          theme: "default",
        }
      }

      const newWidget: Widget = {
        id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: widgetType,
        x: 0,
        y: 0,
        w: widgetConfig.defaultSize.w,
        h: widgetConfig.defaultSize.h,
        title,
        isResizable: true,
        isDraggable: true,
        config: {
          ...baseConfig,
          ...specificConfig,
        },
      }

      const updatedWidgets = [...widgets, newWidget]
      setWidgets(updatedWidgets)

      const updatedLayout = {
        ...currentLayout,
        widgets: updatedWidgets,
      }

      setCurrentLayout(updatedLayout)
      saveDashboard(userId, updatedLayout)
      setShowAddWidget(false)
      setShowChartTypes(false)
      setSelectedChartType("")

      // Reset user action flag after a delay
      setTimeout(() => {
        isUserActionRef.current = false
      }, 500)
    },
    [currentLayout, widgets, userId, saveDashboard],
  )

  const removeWidget = useCallback(
    (widgetId: string) => {
      console.log("Removing widget:", widgetId)

      if (!currentLayout) {
        console.log("removeWidget - No current layout")
        return
      }

      // Set user action flag
      isUserActionRef.current = true

      const updatedWidgets = widgets.filter((widget) => widget.id !== widgetId)
      console.log("removeWidget - Updated widgets:", updatedWidgets.length)

      setWidgets(updatedWidgets)

      const updatedLayout = {
        ...currentLayout,
        widgets: updatedWidgets,
      }

      setCurrentLayout(updatedLayout)
      saveDashboard(userId, updatedLayout)
      setShowDeleteConfirm(null)

      // Reset user action flag after a delay
      setTimeout(() => {
        isUserActionRef.current = false
      }, 500)
    },
    [currentLayout, widgets, userId, saveDashboard],
  )

  const updateWidget = useCallback(
    (widgetId: string, updates: Partial<Widget>) => {
      console.log("updateWidget called with:", { widgetId, updates })

      if (!currentLayout) return

      // Set user action flag
      isUserActionRef.current = true

      const updatedWidgets = widgets.map((widget) => (widget.id === widgetId ? { ...widget, ...updates } : widget))

      setWidgets(updatedWidgets)

      const updatedLayout = {
        ...currentLayout,
        widgets: updatedWidgets,
      }

      setCurrentLayout(updatedLayout)
      saveDashboard(userId, updatedLayout)

      // Reset user action flag after a delay
      setTimeout(() => {
        isUserActionRef.current = false
      }, 500)
    },
    [currentLayout, widgets, userId, saveDashboard],
  )

  const handleWidgetEdit = useCallback((widget: Widget) => {
    console.log("handleWidgetEdit called for widget:", widget.id)
    setEditingWidget(widget)
  }, [])

  const handleWidgetDelete = useCallback((widgetId: string) => {
    console.log("handleWidgetDelete called for widget:", widgetId)
    setShowDeleteConfirm(widgetId)
  }, [])

  const handleLogout = () => {
    localStorage?.removeItem("isLoggedIn")
    localStorage?.removeItem("userEmail")
    localStorage?.removeItem("userId")
    router.push("/")
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-xl border-b border-white/20 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <div>
              <h1 className="text-white font-semibold text-lg">Dashboard</h1>
              <p className="text-white/60 text-sm">{userEmail}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isSaving && (
              <div className="flex items-center space-x-2 text-white/60">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span className="text-sm">Saving...</span>
              </div>
            )}

            <button
              onClick={() => setShowAddWidget(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Widget</span>
            </button>

            <button
              onClick={() => addWidget("data-table")}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-teal-700 transition-all"
            >
              <Users className="w-4 h-4" />
              <span>Demo Table</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all"
            >
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {widgets.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-12 h-12 text-white/60" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Your Dashboard is Empty</h2>
              <p className="text-white/60 mb-8">Add your first widget to get started</p>
              <button
                onClick={() => setShowAddWidget(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Add Your First Widget
              </button>
            </div>
          ) : (
            <ReactGridLayout
              className="layout"
              layout={widgets.map((widget) => ({
                i: widget.id,
                x: widget.x,
                y: widget.y,
                w: widget.w,
                h: widget.h,
                minW: widget.minW || 1,
                minH: widget.minH || 1,
                maxW: widget.maxW || 12,
                maxH: widget.maxH || 12,
                isResizable: widget.isResizable !== false,
                isDraggable: widget.isDraggable !== false,
              }))}
              onLayoutChange={handleLayoutChange}
              cols={currentLayout?.gridCols || 12}
              rowHeight={currentLayout?.gridRowHeight || 150}
              width={1200}
              margin={currentLayout?.margin || [10, 10]}
              containerPadding={currentLayout?.containerPadding || [10, 10]}
              isDraggable={true}
              isResizable={true}
              resizeHandles={["se"]}
              useCSSTransforms={true}
              preventCollision={false}
              compactType="vertical"
            >
              {widgets.map((widget) => (
                <div key={widget.id} className="widget-container">
                  <WidgetComponent
                    widget={widget}
                    onRemove={() => handleWidgetDelete(widget.id)}
                    onEdit={() => handleWidgetEdit(widget)}
                    onUpdate={(updates) => updateWidget(widget.id, updates)}
                  />
                </div>
              ))}
            </ReactGridLayout>
          )}
        </div>
      </main>

      {/* Add Widget Modal */}
      {showAddWidget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">{showChartTypes ? "Select Chart Type" : "Add Widget"}</h2>
              <button
                onClick={() => {
                  setShowAddWidget(false)
                  setShowChartTypes(false)
                  setSelectedChartType("")
                }}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {showChartTypes ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CHART_TYPES.map((chartType) => {
                  const IconComponent = chartType.icon
                  return (
                    <button
                      key={chartType.type}
                      onClick={() => addWidget("chart", chartType.type)}
                      className="flex items-center space-x-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all text-left"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{chartType.title}</h3>
                        <p className="text-white/60 text-sm">Interactive {chartType.type} chart</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {WIDGET_TYPES.map((widgetType) => {
                  const IconComponent = widgetType.icon
                  return (
                    <button
                      key={widgetType.type}
                      onClick={() => {
                        if (widgetType.hasSubTypes && widgetType.type === "chart") {
                          setShowChartTypes(true)
                        } else {
                          addWidget(widgetType.type)
                        }
                      }}
                      className="flex items-center space-x-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all text-left"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{widgetType.title}</h3>
                        <p className="text-white/60 text-sm">
                          {widgetType.hasSubTypes
                            ? "Multiple chart types available"
                            : `${widgetType.defaultSize.w}x${widgetType.defaultSize.h} grid units`}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Delete Widget</h2>
              <p className="text-white/60 mb-6">
                Are you sure you want to delete this widget? This action cannot be undone.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => removeWidget(showDeleteConfirm)}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Widget Edit Modal */}
      {editingWidget && (
        <WidgetEditModal
          widget={editingWidget}
          onSave={(updates) => {
            updateWidget(editingWidget.id, updates)
            setEditingWidget(null)
          }}
          onClose={() => setEditingWidget(null)}
        />
      )}

      {/* Custom Styles */}
      <style jsx global>{`
        .react-grid-layout {
          position: relative;
        }
        
        .react-grid-item {
          transition: all 200ms ease;
          transition-property: left, top;
        }
        
        .react-grid-item.cssTransforms {
          transition-property: transform;
        }
        
        .react-grid-item > .react-resizable-handle {
          position: absolute;
          width: 20px;
          height: 20px;
          bottom: 0;
          right: 0;
          background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNiIgaGVpZ2h0PSI2IiB2aWV3Qm94PSIwIDAgNiA2IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZG90cyBmaWxsPSIjOTk5IiBkPSJtMTUgMTJjMCAuNTUyLS40NDggMS0xIDFzLTEtLjQ0OC0xLTEgLjQ0OC0xIDEtMSAxIC40NDggMSAxem0wIDRjMCAuNTUyLS40NDggMS0xIDFzLTEtLjQ0OC0xLTEgLjQ0OC0xIDEtMSAxIC40NDggMSAxem0wIDRjMCAuNTUyLS40NDgtMS0xIDFzMSAuNDQ4IDEgMS0uNDQ4IDEtMSAxLTEtLjQ0OC0xLTF6bTUtNGMwLS41NTIuNDQ4LTEgMS0xczEgLjQ0OCAxIDEtLjQ0OCAxLTEgMS0xLS40NDgtMS0xem0wIDhjMC0uNTUyLjQ0OC0xIDEtMXMxIC40NDggMSAxLS40NDggMS0xIDEtMS0uNDQ4LTEtMXptNS00YzAtLjU1Mi40NDgtMSAxLTFzMSAuNDQ4IDEgMS0uNDQ4IDEtMSAxLTEtLjQ0OC0xLTF6bTAtNGMwLS41NTIuNDQ4LTEgMS0xczEgLjQ0OCAxIDEtLjQ0OCAxLTEgMS0xLS40NDgtMS0xem0wIDhjMC0uNTUyLjQ0OC0xIDEtMXMxIC40NDggMSAxLS40NDggMS0xIDEtMS0uNDQ4LTEtMXoiLz4KPHN2Zz4K');
          background-position: bottom right;
          padding: 0 3px 3px 0;
          background-repeat: no-repeat;
          background-origin: content-box;
          box-sizing: border-box;
          cursor: se-resize;
        }
        
        .widget-container {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          overflow: hidden;
          height: 100%;
        }
        
        .react-grid-item.react-grid-placeholder {
          background: rgba(59, 130, 246, 0.3);
          opacity: 0.2;
          transition-duration: 100ms;
          z-index: 2;
          user-select: none;
          border-radius: 12px;
        }

        .widget-header-button {
          pointer-events: auto !important;
          z-index: 50 !important;
          position: relative !important;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }

        .widget-header-button:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .widget-container .react-grid-item {
          pointer-events: auto;
        }

        .widget-container .widget-header-button * {
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}

// Widget Component
interface WidgetComponentProps {
  widget: Widget
  onRemove: () => void
  onEdit: () => void
  onUpdate: (updates: Partial<Widget>) => void
}

function WidgetComponent({ widget, onRemove, onEdit, onUpdate }: WidgetComponentProps) {
  const getWidgetIcon = (type: string) => {
    const widgetType = WIDGET_TYPES.find((w) => w.type === type)
    return widgetType?.icon || FileText
  }

  const IconComponent = getWidgetIcon(widget.type)
  const backgroundColor = (widget.config?.backgroundColor as string) || "bg-white/5"

  const handleEditClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      e.nativeEvent.stopImmediatePropagation()
      console.log("Edit button clicked for widget:", widget.id)
      onEdit()
    },
    [onEdit, widget.id],
  )

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      e.nativeEvent.stopImmediatePropagation()
      console.log("Delete button clicked for widget:", widget.id)
      onRemove()
    },
    [onRemove, widget.id],
  )

  return (
    <div className={`h-full flex flex-col ${backgroundColor}`}>
      {/* Widget Header */}
      <div
        className="flex items-center justify-between p-3 border-b border-white/10"
        onMouseDown={(e) => {
          // Only prevent drag if clicking on buttons
          const target = e.target as HTMLElement
          if (target.closest(".widget-header-button")) {
            e.stopPropagation()
          }
        }}
      >
        <div className="flex items-center space-x-2">
          <IconComponent className="w-4 h-4 text-white/80" />
          <h3 className="text-white font-medium text-sm">{widget.title}</h3>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={handleEditClick}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="widget-header-button p-1 text-white/60 hover:text-white transition-colors relative z-50"
            title="Edit widget"
            type="button"
          >
            <Settings className="w-3 h-3 pointer-events-none" />
          </button>
          <button
            onClick={handleDeleteClick}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="widget-header-button p-1 text-white/60 hover:text-red-400 transition-colors relative z-50"
            title="Delete widget"
            type="button"
          >
            <Trash2 className="w-3 h-3 pointer-events-none" />
          </button>
        </div>
      </div>

      {/* Widget Content */}
      <div className="flex-1 p-4">
        <WidgetContent widget={widget} />
      </div>
    </div>
  )
}

// Widget Edit Modal Component
interface WidgetEditModalProps {
  widget: Widget
  onSave: (updates: Partial<Widget>) => void
  onClose: () => void
}
//test
function WidgetEditModal({ widget, onSave, onClose }: WidgetEditModalProps) {
  const [title, setTitle] = useState(widget.title || "")
  const [selectedColor, setSelectedColor] = useState((widget.config?.color as string) || "from-blue-500 to-blue-700")
  const [selectedBg, setSelectedBg] = useState((widget.config?.backgroundColor as string) || "bg-blue-500/20")
  const [config, setConfig] = useState(widget.config || {})

  const handleSave = () => {
    const updates: Partial<Widget> = {
      title,
      config: {
        ...config,
        color: selectedColor,
        backgroundColor: selectedBg,
      },
    }
    onSave(updates)
  }

  const updateConfig = (key: string, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  const addTableColumn = () => {
    const columns = (config.columns as any[]) || []
    const newColumn = {
      id: `col_${Date.now()}`,
      label: "New Column",
      type: "text",
      color: "#ffffff",
    }
    updateConfig("columns", [...columns, newColumn])
  }

  const updateTableColumn = (index: number, field: string, value: any) => {
    const columns = [...((config.columns as any[]) || [])]
    columns[index] = { ...columns[index], [field]: value }
    updateConfig("columns", columns)
  }

  const removeTableColumn = (index: number) => {
    const columns = [...((config.columns as any[]) || [])]
    columns.splice(index, 1)
    updateConfig("columns", columns)
  }

  const addChartDataPoint = () => {
    const data = (config.data as any[]) || []
    const newPoint = { name: `Point ${data.length + 1}`, value: 0 }
    updateConfig("data", [...data, newPoint])
  }

  const updateChartDataPoint = (index: number, field: string, value: any) => {
    const data = [...((config.data as any[]) || [])]
    data[index] = { ...data[index], [field]: value }
    updateConfig("data", data)
  }

  const removeChartDataPoint = (index: number) => {
    const data = [...((config.data as any[]) || [])]
    data.splice(index, 1)
    updateConfig("data", data)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Edit Widget</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Basic Settings */}
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                <Type className="w-4 h-4 inline mr-2" />
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Widget title"
              />
            </div>

            {/* Color Theme */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                <Palette className="w-4 h-4 inline mr-2" />
                Color Theme
              </label>
              <div className="grid grid-cols-3 gap-2">
                {WIDGET_COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => {
                      setSelectedColor(color.value)
                      setSelectedBg(color.bg)
                    }}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedColor === color.value ? "border-white" : "border-white/20 hover:border-white/40"
                    }`}
                  >
                    <div className={`w-full h-6 bg-gradient-to-r ${color.value} rounded`} />
                    <p className="text-white/80 text-xs mt-1">{color.name}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Widget-specific Settings */}
          <div className="space-y-4">
            {/* Card Widget Settings */}
            {widget.type === "card" && (
              <>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Message</label>
                  <textarea
                    value={(config.message as string) || ""}
                    onChange={(e) => updateConfig("message", e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Card message"
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.showIcon as boolean}
                      onChange={(e) => updateConfig("showIcon", e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-white/80 text-sm">Show Icon</span>
                  </label>
                  <select
                    value={(config.textAlign as string) || "center"}
                    onChange={(e) => updateConfig("textAlign", e.target.value)}
                    className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </>
            )}

            {/* Metric Widget Settings */}
            {widget.type === "metric" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Value</label>
                    <input
                      type="text"
                      value={(config.value as string) || ""}
                      onChange={(e) => updateConfig("value", e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1,234"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Label</label>
                    <input
                      type="text"
                      value={(config.label as string) || ""}
                      onChange={(e) => updateConfig("label", e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Total Users"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Change</label>
                    <input
                      type="text"
                      value={(config.change as string) || ""}
                      onChange={(e) => updateConfig("change", e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+12%"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Prefix</label>
                    <input
                      type="text"
                      value={(config.prefix as string) || ""}
                      onChange={(e) => updateConfig("prefix", e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="$"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Suffix</label>
                    <input
                      type="text"
                      value={(config.suffix as string) || ""}
                      onChange={(e) => updateConfig("suffix", e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="K"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.showTrend as boolean}
                      onChange={(e) => updateConfig("showTrend", e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-white/80 text-sm">Show Trend</span>
                  </label>
                  <div>
                    <label className="block text-white/80 text-xs mb-1">Change Color</label>
                    <input
                      type="color"
                      value={(config.changeColor as string) || "#10b981"}
                      onChange={(e) => updateConfig("changeColor", e.target.value)}
                      className="w-8 h-8 rounded border border-white/20"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Table Widget Settings */}
            {widget.type === "table" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-white font-medium">Table Columns</h3>
                  <button
                    onClick={addTableColumn}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Add Column
                  </button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {((config.columns as any[]) || []).map((column, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-white/5 rounded">
                      <input
                        type="text"
                        value={column.label}
                        onChange={(e) => updateTableColumn(index, "label", e.target.value)}
                        className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm"
                        placeholder="Column name"
                      />
                      <select
                        value={column.type}
                        onChange={(e) => updateTableColumn(index, "type", e.target.value)}
                        className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm"
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="badge">Badge</option>
                      </select>
                      <input
                        type="color"
                        value={column.color}
                        onChange={(e) => updateTableColumn(index, "color", e.target.value)}
                        className="w-6 h-6 rounded border border-white/20"
                      />
                      <button onClick={() => removeTableColumn(index)} className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.showHeaders as boolean}
                      onChange={(e) => updateConfig("showHeaders", e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-white/80 text-sm">Show Headers</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.alternateRows as boolean}
                      onChange={(e) => updateConfig("alternateRows", e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-white/80 text-sm">Alternate Rows</span>
                  </label>
                </div>
              </div>
            )}

            {/* Chart Widget Settings */}
            {widget.type === "chart" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Chart Type</label>
                  <select
                    value={(config.chartType as string) || "bar"}
                    onChange={(e) => updateConfig("chartType", e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  >
                    {CHART_TYPES.map((chart) => (
                      <option key={chart.type} value={chart.type}>
                        {chart.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">X-Axis Field</label>
                    <input
                      type="text"
                      value={(config.xAxis as string) || ""}
                      onChange={(e) => updateConfig("xAxis", e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="name"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Y-Axis Field</label>
                    <input
                      type="text"
                      value={(config.yAxis as string) || ""}
                      onChange={(e) => updateConfig("yAxis", e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="value"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-white/80 text-sm font-medium">Data Points</label>
                    <button
                      onClick={addChartDataPoint}
                      className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                    >
                      <Plus className="w-3 h-3 inline mr-1" />
                      Add
                    </button>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {((config.data as any[]) || []).map((point, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-white/5 rounded">
                        <input
                          type="text"
                          value={point.name}
                          onChange={(e) => updateChartDataPoint(index, "name", e.target.value)}
                          className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm"
                          placeholder="Label"
                        />
                        <input
                          type="number"
                          value={point.value}
                          onChange={(e) => updateChartDataPoint(index, "value", Number(e.target.value))}
                          className="w-20 bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm"
                          placeholder="Value"
                        />
                        <button onClick={() => removeChartDataPoint(index)} className="text-red-400 hover:text-red-300">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Calendar Widget Settings */}
            {widget.type === "calendar" && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.showWeekends as boolean}
                      onChange={(e) => updateConfig("showWeekends", e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-white/80 text-sm">Show Weekends</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.highlightToday as boolean}
                      onChange={(e) => updateConfig("highlightToday", e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-white/80 text-sm">Highlight Today</span>
                  </label>
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Theme</label>
                  <select
                    value={(config.theme as string) || "default"}
                    onChange={(e) => updateConfig("theme", e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="default">Default</option>
                    <option value="minimal">Minimal</option>
                    <option value="colorful">Colorful</option>
                  </select>
                </div>
              </div>
            )}

            {/* Advanced Data Table Widget Settings */}
            {widget.type === "data-table" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-white font-medium">Table Columns</h3>
                  <button
                    onClick={addTableColumn}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Add Column
                  </button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {((config.columns as any[]) || []).map((column, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-white/5 rounded">
                      <input
                        type="text"
                        value={column.label}
                        onChange={(e) => updateTableColumn(index, "label", e.target.value)}
                        className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm"
                        placeholder="Column name"
                      />
                      <select
                        value={column.type}
                        onChange={(e) => updateTableColumn(index, "type", e.target.value)}
                        className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm"
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="badge">Badge</option>
                        <option value="currency">Currency</option>
                        <option value="percentage">Percentage</option>
                      </select>
                      <div className="flex items-center space-x-1">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={column.sortable}
                            onChange={(e) => updateTableColumn(index, "sortable", e.target.checked)}
                            className="w-3 h-3 rounded"
                          />
                          <span className="text-xs text-white/60 ml-1">Sort</span>
                        </label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={column.filterable}
                            onChange={(e) => updateTableColumn(index, "filterable", e.target.checked)}
                            className="w-3 h-3 rounded"
                          />
                          <span className="text-xs text-white/60 ml-1">Filter</span>
                        </label>
                      </div>
                      <input
                        type="number"
                        value={column.width || 100}
                        onChange={(e) => updateTableColumn(index, "width", Number(e.target.value))}
                        className="w-16 bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs"
                        placeholder="Width"
                      />
                      <button onClick={() => removeTableColumn(index)} className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Table Features */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-white/80 text-sm font-medium">Features</h4>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={config.infiniteScroll as boolean}
                          onChange={(e) => updateConfig("infiniteScroll", e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-white/80 text-sm">Infinite Scroll</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={config.selectable as boolean}
                          onChange={(e) => updateConfig("selectable", e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-white/80 text-sm">Row Selection</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={config.virtualScrolling as boolean}
                          onChange={(e) => updateConfig("virtualScrolling", e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-white/80 text-sm">Virtual Scrolling</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-white/80 text-sm font-medium">Filters & Search</h4>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={typeof config.filters === "object" && config.filters !== null && "globalSearch" in config.filters ? (config.filters.globalSearch as boolean) : false}
                          onChange={(e) =>
                            updateConfig("filters", { ...(typeof config.filters === "object" && config.filters !== null ? config.filters : {}), globalSearch: e.target.checked })
                          }
                          className="rounded"
                        />
                        <span className="text-white/80 text-sm">Global Search</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={typeof config.filters === "object" && config.filters !== null && "columnFilters" in config.filters ? (config.filters.columnFilters as boolean) : false}
                          onChange={(e) =>
                            updateConfig(
                              "filters",
                              {
                                ...(typeof config.filters === "object" && config.filters !== null ? config.filters : {}),
                                columnFilters: e.target.checked,
                              }
                            )
                          }
                          className="rounded"
                        />
                        <span className="text-white/80 text-sm">Column Filters</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={typeof config.sorting === "object" && config.sorting !== null && "multiSort" in config.sorting ? (config.sorting.multiSort as boolean) : false}
                          onChange={(e) =>
                            updateConfig(
                              "sorting",
                              {
                                ...(typeof config.sorting === "object" && config.sorting !== null ? config.sorting : {}),
                                multiSort: e.target.checked,
                              }
                            )
                          }
                          className="rounded"
                        />
                        <span className="text-white/80 text-sm">Multi-Sort</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Pagination Settings */}
                {!config.infiniteScroll && (
                  <div className="space-y-2">
                    <h4 className="text-white/80 text-sm font-medium">Pagination</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/80 text-xs mb-1">Page Size</label>
                        <select
                          value={Number(config.pagination && typeof config.pagination === "object" && "pageSize" in config.pagination ? config.pagination.pageSize : 25)}
                          onChange={(e) =>
                            updateConfig(
                              "pagination",
                              { ...(typeof config.pagination === "object" && config.pagination !== null ? config.pagination : {}), pageSize: Number(e.target.value) }
                            )
                          }
                          className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm"
                        >
                          <option value={10}>10 per page</option>
                          <option value={25}>25 per page</option>
                          <option value={50}>50 per page</option>
                          <option value={100}>100 per page</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={typeof config.pagination === "object" && config.pagination !== null && "showSizeSelector" in config.pagination ? (config.pagination.showSizeSelector as boolean) : false}
                            onChange={(e) =>
                              updateConfig(
                                "pagination",
                                {
                                  ...(typeof config.pagination === "object" && config.pagination !== null ? config.pagination : {}),
                                  showSizeSelector: e.target.checked,
                                }
                              )
                            }
                            className="rounded"
                          />
                          <span className="text-white/80 text-sm">Size Selector</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Data Management */}
                <div className="space-y-2">
                  <h4 className="text-white/80 text-sm font-medium">Data</h4>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => {
                        const newData = generateSampleData(500)
                        updateConfig("data", newData)
                      }}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Generate 500 Records
                    </button>
                    <button
                      onClick={() => {
                        const newData = generateSampleData(1000)
                        updateConfig("data", newData)
                      }}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Generate 1000 Records
                    </button>
                    <span className="text-white/60 text-sm">
                      Current: {(config.data as any[])?.length || 0} records
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-4 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// Widget Content Component
function WidgetContent({ widget }: { widget: Widget }) {
  const color = (widget.config?.color as string) || "from-blue-500 to-blue-700"

  switch (widget.type) {
    case "data-table":
      const dataTableConfig = widget.config as any
      return (
        <AdvancedDataTable
          config={dataTableConfig}
          onConfigChange={(newConfig) => {
            // Update widget config
            const updatedWidget = { ...widget, config: newConfig }
            // This would trigger the parent update
          }}
          height={widget.h * 150 - 100} // Adjust based on widget height
        />
      )

    case "chart":
      const chartConfig = widget.config as any
      return (
        <AdvancedChart
          config={chartConfig}
          onConfigChange={(newConfig) => {
            // Update widget config
            const updatedWidget = { ...widget, config: newConfig }
            // This would trigger the parent update
          }}
        />
      )

    case "card":
      const cardConfig = widget.config as any
      return (
        <div className="h-full flex items-center justify-center">
          <div className={`text-${cardConfig.textAlign || "center"}`}>
            {cardConfig.showIcon && (
              <div
                className={`w-16 h-16 bg-gradient-to-r ${color} rounded-full flex items-center justify-center mx-auto mb-4`}
              >
                <FileText className="w-8 h-8 text-white" />
              </div>
            )}
            <h4 className="text-white text-lg font-semibold mb-2">{widget.title}</h4>
            <p className="text-white/60 text-sm">{cardConfig.message || "This is a sample card widget"}</p>
          </div>
        </div>
      )

    case "metric":
      const metricConfig = widget.config as any
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">
              {metricConfig.prefix || ""}
              {metricConfig.value || "1,234"}
              {metricConfig.suffix || ""}
            </div>
            <div className="text-white/60 text-sm">{metricConfig.label || "Total Users"}</div>
            {metricConfig.showTrend && metricConfig.change && (
              <div className="text-xs mt-1" style={{ color: metricConfig.changeColor || "#10b981" }}>
                {metricConfig.change} from last month
              </div>
            )}
          </div>
        </div>
      )

    case "table":
      const simpleTableConfig = widget.config as any
      const columns = simpleTableConfig.columns || []
      const data = simpleTableConfig.data || []

      return (
        <div className="h-full overflow-auto">
          <table className="w-full text-sm">
            {simpleTableConfig.showHeaders && (
              <thead>
                <tr className="border-b border-white/10">
                  {columns.map((column: any, index: number) => (
                    <th key={index} className="text-left p-2 font-medium" style={{ color: column.color }}>
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {data.map((row: any, rowIndex: number) => (
                <tr
                  key={rowIndex}
                  className={`${simpleTableConfig.alternateRows && rowIndex % 2 === 1 ? "bg-white/5" : ""} border-b border-white/5`}
                >
                  {columns.map((column: any, colIndex: number) => (
                    <td key={colIndex} className="p-2">
                      {column.type === "badge" ? (
                        <span
                          className="px-2 py-1 rounded-full text-xs"
                          style={{
                            backgroundColor: `${column.color}20`,
                            color: column.color,
                            border: `1px solid ${column.color}40`,
                          }}
                        >
                          {row[column.id]}
                        </span>
                      ) : (
                        <span style={{ color: column.color }}>{row[column.id]}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )

    case "calendar":
      const calendarConfig = widget.config as any
      const today = new Date()
      const currentMonth = today.getMonth()
      const currentYear = today.getFullYear()
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
      const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()

      return (
        <div className="h-full p-2">
          <div className="text-center mb-2">
            <div
              className={`w-8 h-8 bg-gradient-to-r ${color} rounded-full flex items-center justify-center mx-auto mb-1`}
            >
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <h4 className="text-white text-sm font-medium">
              {today.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h4>
          </div>

          <div className="grid grid-cols-7 gap-1 text-xs">
            {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
              <div key={index} className="text-center text-white/60 font-medium p-1">
                {calendarConfig.showWeekends || (index !== 0 && index !== 6) ? day : ""}
              </div>
            ))}

            {Array.from({ length: firstDayOfMonth }, (_, index) => (
              <div key={`empty-${index}`} className="p-1"></div>
            ))}

            {Array.from({ length: daysInMonth }, (_, index) => {
              const day = index + 1
              const isToday = day === today.getDate()
              const isWeekend = (firstDayOfMonth + index) % 7 === 0 || (firstDayOfMonth + index) % 7 === 6

              if (!calendarConfig.showWeekends && isWeekend) {
                return <div key={day} className="p-1"></div>
              }

              return (
                <div
                  key={day}
                  className={`text-center p-1 rounded ${
                    isToday && calendarConfig.highlightToday
                      ? "bg-blue-500 text-white"
                      : "text-white/80 hover:bg-white/10"
                  }`}
                >
                  {day}
                </div>
              )
            })}
          </div>
        </div>
      )

    default:
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div
              className={`w-16 h-16 bg-gradient-to-r ${color} rounded-full flex items-center justify-center mx-auto mb-4`}
            >
              <FileText className="w-8 h-8 text-white" />
            </div>
            <p className="text-white/60 text-sm">Widget content</p>
          </div>
        </div>
      )
  }
}